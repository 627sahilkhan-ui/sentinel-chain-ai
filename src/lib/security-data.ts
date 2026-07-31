import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Repository = Tables<"repositories">;
export type Sbom = Tables<"sboms">;
export type Dependency = Tables<"dependencies">;
export type Vulnerability = Tables<"vulnerabilities">;
export type Remediation = Tables<"remediations">;
export type AuditLog = Tables<"audit_logs">;
export type Match = Tables<"vulnerability_matches"> & {
  vulnerabilities: Vulnerability | null;
  repositories: Pick<Repository, "id" | "name" | "criticality" | "internet_facing"> | null;
  dependencies: Pick<Dependency, "id" | "package_name" | "version"> | null;
};

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as T;
}

export const repositoriesQuery = {
  queryKey: ["repositories"],
  queryFn: async () =>
    unwrap<Repository[]>(
      await supabase.from("repositories").select("*").order("health_score", { ascending: true }),
    ),
};

export const sbomsQuery = {
  queryKey: ["sboms"],
  queryFn: async () =>
    unwrap<(Sbom & { repositories: { name: string } | null })[]>(
      await supabase
        .from("sboms")
        .select("*, repositories(name)")
        .order("generated_at", { ascending: false }),
    ),
};

export const dependenciesQuery = {
  queryKey: ["dependencies"],
  queryFn: async () =>
    unwrap<(Dependency & { repositories: { name: string } | null })[]>(
      await supabase
        .from("dependencies")
        .select("*, repositories(name)")
        .order("package_name"),
    ),
};

export const matchesQuery = {
  queryKey: ["matches"],
  queryFn: async () =>
    unwrap<Match[]>(
      await supabase
        .from("vulnerability_matches")
        .select(
          "*, vulnerabilities(*), repositories(id,name,criticality,internet_facing), dependencies(id,package_name,version)",
        )
        .order("risk_score", { ascending: false }),
    ),
};

export const remediationsQuery = {
  queryKey: ["remediations"],
  queryFn: async () =>
    unwrap<(Remediation & { repositories: { name: string } | null })[]>(
      await supabase
        .from("remediations")
        .select("*, repositories(name)")
        .order("created_at", { ascending: false }),
    ),
};

export const auditLogsQuery = {
  queryKey: ["audit_logs"],
  queryFn: async () =>
    unwrap<AuditLog[]>(
      await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
    ),
};

export async function logAudit(action: string, entity: string, detail: string) {
  const { data } = await supabase.auth.getUser();
  await supabase.from("audit_logs").insert({
    actor: data.user?.email ?? "system",
    action,
    entity,
    detail,
  });
}

/** Risk score per PRD Step 9: CVSS + exploitability + exposure + criticality. */
export function computeRiskScore(input: {
  cvss: number;
  exploitAvailable: boolean;
  publicPoc: boolean;
  runtimeExposure: boolean;
  internetFacing: boolean;
  criticality: string;
}) {
  const criticalityWeight =
    input.criticality === "critical" ? 12 : input.criticality === "high" ? 8 : input.criticality === "medium" ? 4 : 0;
  const score =
    input.cvss * 7 +
    (input.exploitAvailable ? 10 : 0) +
    (input.publicPoc ? 5 : 0) +
    (input.runtimeExposure ? 8 : 0) +
    (input.internetFacing ? 6 : 0) +
    criticalityWeight;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function riskLevel(score: number) {
  if (score >= 90) return "critical" as const;
  if (score >= 70) return "high" as const;
  if (score >= 40) return "medium" as const;
  return "low" as const;
}

export function severityTone(level: string) {
  switch (level) {
    case "critical":
      return "bg-critical/15 text-critical border-critical/30";
    case "high":
      return "bg-warning/15 text-warning border-warning/30";
    case "medium":
      return "bg-primary/10 text-primary border-primary/25";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function statusTone(status: string) {
  switch (status) {
    case "merged":
    case "resolved":
      return "bg-success/15 text-success border-success/30";
    case "failed":
      return "bg-critical/15 text-critical border-critical/30";
    case "pr_open":
    case "remediating":
    case "testing":
      return "bg-primary/10 text-primary border-primary/25";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function timeAgo(iso: string | null) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadJson(filename: string, data: unknown) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
