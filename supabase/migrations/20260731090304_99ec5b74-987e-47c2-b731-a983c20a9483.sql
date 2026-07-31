
DROP POLICY "sboms write own" ON public.sboms;
DROP POLICY "deps write own" ON public.dependencies;
DROP POLICY "matches write own" ON public.vulnerability_matches;
DROP POLICY "remediations write own" ON public.remediations;
DROP FUNCTION IF EXISTS public.owns_repository(uuid);

CREATE POLICY "sboms write own" ON public.sboms FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.repositories r WHERE r.id = sboms.repository_id AND r.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.repositories r WHERE r.id = sboms.repository_id AND r.owner_id = auth.uid()));

CREATE POLICY "deps write own" ON public.dependencies FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.repositories r WHERE r.id = dependencies.repository_id AND r.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.repositories r WHERE r.id = dependencies.repository_id AND r.owner_id = auth.uid()));

CREATE POLICY "matches write own" ON public.vulnerability_matches FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.repositories r WHERE r.id = vulnerability_matches.repository_id AND r.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.repositories r WHERE r.id = vulnerability_matches.repository_id AND r.owner_id = auth.uid()));

CREATE POLICY "remediations write own" ON public.remediations FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.repositories r WHERE r.id = remediations.repository_id AND r.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.repositories r WHERE r.id = remediations.repository_id AND r.owner_id = auth.uid()));

DROP POLICY "audit insert" ON public.audit_logs;
CREATE POLICY "audit insert" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
