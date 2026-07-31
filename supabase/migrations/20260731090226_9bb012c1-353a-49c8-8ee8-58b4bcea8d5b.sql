
CREATE TABLE public.repositories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  owner text NOT NULL,
  provider text NOT NULL DEFAULT 'github',
  default_branch text NOT NULL DEFAULT 'main',
  language text,
  health_score int NOT NULL DEFAULT 100,
  monitored boolean NOT NULL DEFAULT true,
  webhook_status text NOT NULL DEFAULT 'active',
  criticality text NOT NULL DEFAULT 'medium',
  internet_facing boolean NOT NULL DEFAULT false,
  last_build_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.sboms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id uuid NOT NULL REFERENCES public.repositories(id) ON DELETE CASCADE,
  build_number text NOT NULL,
  format text NOT NULL DEFAULT 'CycloneDX',
  signature text,
  commit_hash text,
  branch text NOT NULL DEFAULT 'main',
  component_count int NOT NULL DEFAULT 0,
  verified boolean NOT NULL DEFAULT true,
  generated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.dependencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sbom_id uuid REFERENCES public.sboms(id) ON DELETE CASCADE,
  repository_id uuid NOT NULL REFERENCES public.repositories(id) ON DELETE CASCADE,
  package_name text NOT NULL,
  version text NOT NULL,
  license text,
  checksum text,
  is_direct boolean NOT NULL DEFAULT true,
  provenance_status text NOT NULL DEFAULT 'verified',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.vulnerabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cve_id text NOT NULL UNIQUE,
  title text NOT NULL,
  severity text NOT NULL,
  cvss_score numeric(3,1) NOT NULL DEFAULT 0,
  package_name text NOT NULL,
  affected_versions text,
  fixed_version text,
  exploit_available boolean NOT NULL DEFAULT false,
  public_poc boolean NOT NULL DEFAULT false,
  source text NOT NULL DEFAULT 'OSV',
  published_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.vulnerability_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vulnerability_id uuid NOT NULL REFERENCES public.vulnerabilities(id) ON DELETE CASCADE,
  repository_id uuid NOT NULL REFERENCES public.repositories(id) ON DELETE CASCADE,
  dependency_id uuid REFERENCES public.dependencies(id) ON DELETE SET NULL,
  risk_score int NOT NULL DEFAULT 0,
  risk_level text NOT NULL DEFAULT 'low',
  runtime_exposure boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'open',
  detected_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.remediations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES public.vulnerability_matches(id) ON DELETE CASCADE,
  repository_id uuid NOT NULL REFERENCES public.repositories(id) ON DELETE CASCADE,
  package_name text NOT NULL,
  old_version text NOT NULL,
  new_version text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  pull_request_url text,
  tests_passed boolean,
  build_passed boolean,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor text NOT NULL DEFAULT 'system',
  action text NOT NULL,
  entity text,
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.repositories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sboms TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dependencies TO authenticated;
GRANT SELECT ON public.vulnerabilities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vulnerability_matches TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.remediations TO authenticated;
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.repositories, public.sboms, public.dependencies, public.vulnerabilities, public.vulnerability_matches, public.remediations, public.audit_logs TO service_role;

ALTER TABLE public.repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sboms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vulnerabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vulnerability_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remediations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.owns_repository(_repo uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.repositories r WHERE r.id = _repo AND r.owner_id = auth.uid());
$$;
REVOKE EXECUTE ON FUNCTION public.owns_repository(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.owns_repository(uuid) TO authenticated;

CREATE POLICY "repos readable by members" ON public.repositories FOR SELECT TO authenticated USING (true);
CREATE POLICY "repos insert own" ON public.repositories FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "repos update own" ON public.repositories FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "repos delete own" ON public.repositories FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE POLICY "sboms readable" ON public.sboms FOR SELECT TO authenticated USING (true);
CREATE POLICY "sboms write own" ON public.sboms FOR ALL TO authenticated USING (public.owns_repository(repository_id)) WITH CHECK (public.owns_repository(repository_id));

CREATE POLICY "deps readable" ON public.dependencies FOR SELECT TO authenticated USING (true);
CREATE POLICY "deps write own" ON public.dependencies FOR ALL TO authenticated USING (public.owns_repository(repository_id)) WITH CHECK (public.owns_repository(repository_id));

CREATE POLICY "vulns readable" ON public.vulnerabilities FOR SELECT TO authenticated USING (true);

CREATE POLICY "matches readable" ON public.vulnerability_matches FOR SELECT TO authenticated USING (true);
CREATE POLICY "matches write own" ON public.vulnerability_matches FOR ALL TO authenticated USING (public.owns_repository(repository_id)) WITH CHECK (public.owns_repository(repository_id));

CREATE POLICY "remediations readable" ON public.remediations FOR SELECT TO authenticated USING (true);
CREATE POLICY "remediations write own" ON public.remediations FOR ALL TO authenticated USING (public.owns_repository(repository_id)) WITH CHECK (public.owns_repository(repository_id));

CREATE POLICY "audit readable" ON public.audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "audit insert" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

INSERT INTO public.repositories (id, name, owner, provider, default_branch, language, health_score, criticality, internet_facing, webhook_status, last_build_at) VALUES
('a1000000-0000-4000-8000-000000000001','payments-core','acme','github','main','TypeScript',92,'critical',true, 'active', now() - interval '2 minutes'),
('a1000000-0000-4000-8000-000000000002','ledger-service','acme','github','main','Go',78,'critical',false,'active', now() - interval '18 minutes'),
('a1000000-0000-4000-8000-000000000003','identity-gateway','acme','gitlab','release/4.2','Java',61,'critical',true,'active', now() - interval '1 hour'),
('a1000000-0000-4000-8000-000000000004','web-console','acme','github','main','TypeScript',88,'high',true,'active', now() - interval '3 hours'),
('a1000000-0000-4000-8000-000000000005','risk-worker','acme','github','main','Python',70,'medium',false,'active', now() - interval '5 hours'),
('a1000000-0000-4000-8000-000000000006','notify-bridge','acme','bitbucket','main','Node.js',84,'low',false,'pending', now() - interval '9 hours');

INSERT INTO public.sboms (id, repository_id, build_number, format, signature, commit_hash, branch, component_count, verified, generated_at) VALUES
('b1000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000001','#2184','CycloneDX','cosign:MEUCIQD8f1a…','9f2c1ab','main',412,true, now() - interval '2 minutes'),
('b1000000-0000-4000-8000-000000000002','a1000000-0000-4000-8000-000000000002','#1177','SPDX','cosign:MEQCIF3b7c…','71ae40d','main',268,true, now() - interval '18 minutes'),
('b1000000-0000-4000-8000-000000000003','a1000000-0000-4000-8000-000000000003','#0932','CycloneDX','cosign:MEYCIQCa19…','c40b8e2','release/4.2',611,false, now() - interval '1 hour'),
('b1000000-0000-4000-8000-000000000004','a1000000-0000-4000-8000-000000000004','#3310','CycloneDX','cosign:MEUCIGh2d1…','2b6f9c4','main',534,true, now() - interval '3 hours'),
('b1000000-0000-4000-8000-000000000005','a1000000-0000-4000-8000-000000000005','#0451','SPDX','cosign:MEQCIBd9a2…','8ee1f70','main',197,true, now() - interval '5 hours'),
('b1000000-0000-4000-8000-000000000006','a1000000-0000-4000-8000-000000000006','#0788','CycloneDX','cosign:MEUCIQDe45…','5da22c9','main',233,true, now() - interval '9 hours');

INSERT INTO public.dependencies (id, sbom_id, repository_id, package_name, version, license, checksum, is_direct, provenance_status) VALUES
('c1000000-0000-4000-8000-000000000001','b1000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000001','axios','1.5.0','MIT','sha256:1f9a…',true,'verified'),
('c1000000-0000-4000-8000-000000000002','b1000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000001','lodash','4.17.20','MIT','sha256:88bc…',false,'verified'),
('c1000000-0000-4000-8000-000000000003','b1000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000001','express','4.18.2','MIT','sha256:3ac1…',true,'verified'),
('c1000000-0000-4000-8000-000000000004','b1000000-0000-4000-8000-000000000002','a1000000-0000-4000-8000-000000000002','golang.org/x/net','0.17.0','BSD-3-Clause','sha256:7de0…',true,'verified'),
('c1000000-0000-4000-8000-000000000005','b1000000-0000-4000-8000-000000000002','a1000000-0000-4000-8000-000000000002','github.com/gin-gonic/gin','1.9.0','MIT','sha256:0ba9…',true,'unsigned'),
('c1000000-0000-4000-8000-000000000006','b1000000-0000-4000-8000-000000000003','a1000000-0000-4000-8000-000000000003','org.apache.logging.log4j:log4j-core','2.14.1','Apache-2.0','sha256:c1f8…',true,'verified'),
('c1000000-0000-4000-8000-000000000007','b1000000-0000-4000-8000-000000000003','a1000000-0000-4000-8000-000000000003','com.fasterxml.jackson.core:jackson-databind','2.12.3','Apache-2.0','sha256:aa41…',false,'unknown-publisher'),
('c1000000-0000-4000-8000-000000000008','b1000000-0000-4000-8000-000000000004','a1000000-0000-4000-8000-000000000004','axios','1.5.0','MIT','sha256:1f9a…',true,'verified'),
('c1000000-0000-4000-8000-000000000009','b1000000-0000-4000-8000-000000000004','a1000000-0000-4000-8000-000000000004','next','14.1.0','MIT','sha256:5cd2…',true,'verified'),
('c1000000-0000-4000-8000-000000000010','b1000000-0000-4000-8000-000000000005','a1000000-0000-4000-8000-000000000005','requests','2.28.1','Apache-2.0','sha256:9f31…',true,'verified'),
('c1000000-0000-4000-8000-000000000011','b1000000-0000-4000-8000-000000000005','a1000000-0000-4000-8000-000000000005','pyyaml','5.3.1','MIT','sha256:2b77…',false,'verified'),
('c1000000-0000-4000-8000-000000000012','b1000000-0000-4000-8000-000000000006','a1000000-0000-4000-8000-000000000006','lodash','4.17.20','MIT','sha256:88bc…',true,'verified');

INSERT INTO public.vulnerabilities (id, cve_id, title, severity, cvss_score, package_name, affected_versions, fixed_version, exploit_available, public_poc, source, published_at) VALUES
('d1000000-0000-4000-8000-000000000001','CVE-2023-45857','axios leaks X-XSRF-TOKEN to third-party hosts','high',8.1,'axios','>=0.8.1 <1.6.0','1.6.0',true,true,'OSV', now() - interval '3 days'),
('d1000000-0000-4000-8000-000000000002','CVE-2021-44228','Log4Shell remote code execution in log4j-core','critical',10.0,'org.apache.logging.log4j:log4j-core','>=2.0 <2.15.0','2.17.1',true,true,'NVD', now() - interval '5 days'),
('d1000000-0000-4000-8000-000000000003','CVE-2020-8203','Prototype pollution in lodash','high',7.4,'lodash','<4.17.19','4.17.21',false,true,'GitHub Advisory', now() - interval '12 days'),
('d1000000-0000-4000-8000-000000000004','CVE-2020-14343','Arbitrary code execution in PyYAML full_load','critical',9.8,'pyyaml','<5.4','5.4.1',true,true,'OSV', now() - interval '8 days'),
('d1000000-0000-4000-8000-000000000005','CVE-2023-44487','HTTP/2 Rapid Reset denial of service','high',7.5,'golang.org/x/net','<0.17.0','0.17.0',true,true,'NVD', now() - interval '2 days'),
('d1000000-0000-4000-8000-000000000006','CVE-2020-36518','jackson-databind deep wrapper array nesting DoS','medium',6.5,'com.fasterxml.jackson.core:jackson-databind','<2.12.6','2.12.6',false,false,'OSV', now() - interval '20 days'),
('d1000000-0000-4000-8000-000000000007','CVE-2023-32681','Requests leaks Proxy-Authorization header','medium',6.1,'requests','<2.31.0','2.31.0',false,false,'GitHub Advisory', now() - interval '30 days'),
('d1000000-0000-4000-8000-000000000008','CVE-2024-34351','Next.js server-side request forgery in server actions','high',7.5,'next','<14.1.1','14.1.1',false,true,'OSV', now() - interval '1 day');

INSERT INTO public.vulnerability_matches (id, vulnerability_id, repository_id, dependency_id, risk_score, risk_level, runtime_exposure, status, detected_at) VALUES
('e1000000-0000-4000-8000-000000000001','d1000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000001',88,'high',true,'remediating', now() - interval '3 days'),
('e1000000-0000-4000-8000-000000000002','d1000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000004','c1000000-0000-4000-8000-000000000008',74,'high',true,'open', now() - interval '3 days'),
('e1000000-0000-4000-8000-000000000003','d1000000-0000-4000-8000-000000000002','a1000000-0000-4000-8000-000000000003','c1000000-0000-4000-8000-000000000006',98,'critical',true,'open', now() - interval '5 days'),
('e1000000-0000-4000-8000-000000000004','d1000000-0000-4000-8000-000000000003','a1000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000002',66,'medium',false,'open', now() - interval '12 days'),
('e1000000-0000-4000-8000-000000000005','d1000000-0000-4000-8000-000000000003','a1000000-0000-4000-8000-000000000006','c1000000-0000-4000-8000-000000000012',43,'medium',false,'open', now() - interval '12 days'),
('e1000000-0000-4000-8000-000000000006','d1000000-0000-4000-8000-000000000004','a1000000-0000-4000-8000-000000000005','c1000000-0000-4000-8000-000000000011',91,'critical',true,'remediating', now() - interval '8 days'),
('e1000000-0000-4000-8000-000000000007','d1000000-0000-4000-8000-000000000005','a1000000-0000-4000-8000-000000000002','c1000000-0000-4000-8000-000000000004',80,'high',true,'resolved', now() - interval '2 days'),
('e1000000-0000-4000-8000-000000000008','d1000000-0000-4000-8000-000000000006','a1000000-0000-4000-8000-000000000003','c1000000-0000-4000-8000-000000000007',52,'medium',false,'open', now() - interval '20 days'),
('e1000000-0000-4000-8000-000000000009','d1000000-0000-4000-8000-000000000007','a1000000-0000-4000-8000-000000000005','c1000000-0000-4000-8000-000000000010',38,'low',false,'accepted', now() - interval '30 days'),
('e1000000-0000-4000-8000-000000000010','d1000000-0000-4000-8000-000000000008','a1000000-0000-4000-8000-000000000004','c1000000-0000-4000-8000-000000000009',72,'high',true,'remediating', now() - interval '1 day');

INSERT INTO public.remediations (id, match_id, repository_id, package_name, old_version, new_version, status, pull_request_url, tests_passed, build_passed, notes, created_at) VALUES
('f1000000-0000-4000-8000-000000000001','e1000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000001','axios','1.5.0','1.7.4','pr_open','https://github.com/acme/payments-core/pull/482',true,true,'42/42 unit tests, 18/18 integration tests passed', now() - interval '4 hours'),
('f1000000-0000-4000-8000-000000000002','e1000000-0000-4000-8000-000000000006','a1000000-0000-4000-8000-000000000005','pyyaml','5.3.1','5.4.1','pr_open','https://github.com/acme/risk-worker/pull/119',true,true,'Nearest secure version, no breaking API change', now() - interval '11 hours'),
('f1000000-0000-4000-8000-000000000003','e1000000-0000-4000-8000-000000000010','a1000000-0000-4000-8000-000000000004','next','14.1.0','14.1.1','testing',NULL,NULL,true,'Integration suite running in isolated environment', now() - interval '40 minutes'),
('f1000000-0000-4000-8000-000000000004','e1000000-0000-4000-8000-000000000007','a1000000-0000-4000-8000-000000000002','golang.org/x/net','0.16.0','0.17.0','merged','https://github.com/acme/ledger-service/pull/301',true,true,'Merged and deployed, vulnerability closed', now() - interval '2 days'),
('f1000000-0000-4000-8000-000000000005','e1000000-0000-4000-8000-000000000003','a1000000-0000-4000-8000-000000000003','org.apache.logging.log4j:log4j-core','2.14.1','2.17.1','failed',NULL,false,false,'Build failed: incompatible SLF4J binding, manual review required', now() - interval '1 day'),
('f1000000-0000-4000-8000-000000000006','e1000000-0000-4000-8000-000000000004','a1000000-0000-4000-8000-000000000001','lodash','4.17.20','4.17.21','pending',NULL,NULL,NULL,'Queued behind axios upgrade', now() - interval '20 minutes');

INSERT INTO public.audit_logs (actor, action, entity, detail, created_at) VALUES
('system','pull_request_created','payments-core','PR #482 opened — bump axios 1.5.0 → 1.7.4', now() - interval '4 minutes'),
('system','sbom_generated','ledger-service','SBOM #1177 signed with Cosign (SPDX)', now() - interval '26 minutes'),
('system','cve_detected','identity-gateway','CVE-2021-44228 matched in log4j-core 2.14.1', now() - interval '1 hour'),
('security@acme.com','compliance_export','organization','SOC 2 compliance report exported as CSV', now() - interval '3 hours'),
('system','risk_assessed','risk-worker','CVE-2020-14343 scored 91 (critical)', now() - interval '8 hours'),
('devsecops@acme.com','repository_onboarded','notify-bridge','Repository registered, webhook pending verification', now() - interval '9 hours'),
('system','remediation_failed','identity-gateway','log4j-core 2.14.1 → 2.17.1 build failed', now() - interval '1 day'),
('release@acme.com','deployment','ledger-service','PR #301 merged and deployed to production', now() - interval '2 days'),
('system','provenance_flagged','ledger-service','gin 1.9.0 is unsigned', now() - interval '3 days'),
('system','sbom_generated','payments-core','SBOM #2184 signed with Cosign (CycloneDX)', now() - interval '2 minutes');
