import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Download, ExternalLink, Zap } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import {
  computeRiskScore,
  downloadCsv,
  logAudit,
  matchesQuery,
  riskLevel,
  severityTone,
  statusTone,
  timeAgo,
  type Match,
} from "@/lib/security-data";

const title = "Vulnerabilities & risk — SentinelChain AI";
const description =
  "Matched CVEs across every SBOM with CVSS, exploit intelligence and a calculated risk score per repository.";

export const Route = createFileRoute("/_authenticated/vulnerabilities")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VulnerabilitiesPage,
});

function VulnerabilitiesPage() {
  const qc = useQueryClient();
  const { data: matches = [], isLoading } = useQuery(matchesQuery);
  const [q, setQ] = useState("");
  const [level, setLevel] = useState("all");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<Match | null>(null);

  const rows = useMemo(
    () =>
      matches.filter((m) => {
        const text = `${m.vulnerabilities?.cve_id} ${m.vulnerabilities?.package_name} ${m.repositories?.name}`.toLowerCase();
        return (
          text.includes(q.toLowerCase()) &&
          (level === "all" || m.risk_level === level) &&
          (status === "all" || m.status === status)
        );
      }),
    [matches, q, level, status],
  );

  const counts = useMemo(() => {
    const by = (l: string) => matches.filter((m) => m.risk_level === l).length;
    return { critical: by("critical"), high: by("high"), medium: by("medium"), low: by("low") };
  }, [matches]);

  const triggerRemediation = useMutation({
    mutationFn: async (m: Match) => {
      const { error } = await supabase.from("remediations").insert({
        match_id: m.id,
        repository_id: m.repository_id,
        package_name: m.vulnerabilities?.package_name ?? "unknown",
        old_version: m.dependencies?.version ?? "unknown",
        new_version: m.vulnerabilities?.fixed_version ?? "latest",
        status: "pending",
        notes: "Queued by analyst from the vulnerability console",
      });
      if (error) throw new Error(error.message);
      await supabase
        .from("vulnerability_matches")
        .update({ status: "remediating" })
        .eq("id", m.id);
      await logAudit(
        "remediation_queued",
        m.repositories?.name ?? "repository",
        `${m.vulnerabilities?.cve_id} — upgrade ${m.vulnerabilities?.package_name} to ${m.vulnerabilities?.fixed_version}`,
      );
    },
    onSuccess: () => {
      toast.success("Remediation queued — build and tests will run before a PR is opened.");
      qc.invalidateQueries({ queryKey: ["matches"] });
      qc.invalidateQueries({ queryKey: ["remediations"] });
      qc.invalidateQueries({ queryKey: ["audit_logs"] });
    },
    onError: () =>
      toast.error("Only repositories you onboarded can be remediated from this console."),
  });

  function exportCsv() {
    downloadCsv(
      `sentinelchain-vulnerabilities-${new Date().toISOString().slice(0, 10)}.csv`,
      rows.map((m) => ({
        cve: m.vulnerabilities?.cve_id,
        severity: m.vulnerabilities?.severity,
        cvss: m.vulnerabilities?.cvss_score,
        package: m.vulnerabilities?.package_name,
        installed_version: m.dependencies?.version,
        fixed_version: m.vulnerabilities?.fixed_version,
        repository: m.repositories?.name,
        risk_score: m.risk_score,
        risk_level: m.risk_level,
        status: m.status,
        detected_at: m.detected_at,
      })),
    );
    toast.success("Vulnerability report exported.");
  }

  return (
    <DashboardShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Vulnerabilities</h1>
          <p className="text-sm text-muted-foreground">
            Modules 4–7 — CVE feeds, dependency matching and weighted risk scoring.
          </p>
        </div>
        <Button variant="outline" onClick={exportCsv}>
          <Download className="size-4" /> Export CSV
        </Button>
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(["critical", "high", "medium", "low"] as const).map((l) => (
          <Card key={l} className="shadow-card border-border/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground capitalize">
                {l} risk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl font-bold">{counts[l]}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-card border-border/70">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Matched findings ({rows.length})</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search CVE, package, repo"
              className="w-56"
            />
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All risk</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="remediating">Remediating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading findings…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CVE</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Repository</TableHead>
                  <TableHead>CVSS</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Detected</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((m) => (
                  <TableRow
                    key={m.id}
                    className="cursor-pointer"
                    onClick={() => setSelected(m)}
                  >
                    <TableCell>
                      <div className="font-medium">{m.vulnerabilities?.cve_id}</div>
                      <div className="max-w-xs truncate text-xs text-muted-foreground">
                        {m.vulnerabilities?.title}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className="font-mono text-xs">{m.dependencies?.package_name}</span>
                      <div className="text-xs text-muted-foreground">
                        {m.dependencies?.version} → {m.vulnerabilities?.fixed_version}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{m.repositories?.name}</TableCell>
                    <TableCell className="text-sm">{m.vulnerabilities?.cvss_score}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={severityTone(m.risk_level)}>
                          {m.risk_score}
                        </Badge>
                        <span className="text-xs text-muted-foreground capitalize">
                          {m.risk_level}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusTone(m.status)}>
                        {m.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {timeAgo(m.detected_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Sheet open={selected !== null} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {selected ? (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <AlertTriangle className="size-4 text-critical" />
                  {selected.vulnerabilities?.cve_id}
                </SheetTitle>
                <SheetDescription>{selected.vulnerabilities?.title}</SheetDescription>
              </SheetHeader>
              <div className="space-y-5 px-4 pb-6">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Calculated risk score</span>
                    <span className="font-semibold">
                      {selected.risk_score} / 100 ({riskLevel(selected.risk_score)})
                    </span>
                  </div>
                  <Progress value={selected.risk_score} className="h-2" />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Recomputed live from CVSS {selected.vulnerabilities?.cvss_score}, exploit
                    availability, runtime exposure, internet accessibility and business
                    criticality:{" "}
                    <strong>
                      {computeRiskScore({
                        cvss: Number(selected.vulnerabilities?.cvss_score ?? 0),
                        exploitAvailable: !!selected.vulnerabilities?.exploit_available,
                        publicPoc: !!selected.vulnerabilities?.public_poc,
                        runtimeExposure: selected.runtime_exposure,
                        internetFacing: !!selected.repositories?.internet_facing,
                        criticality: selected.repositories?.criticality ?? "medium",
                      })}
                    </strong>
                  </p>
                </div>

                <dl className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ["Repository", selected.repositories?.name],
                    ["Package", selected.dependencies?.package_name],
                    ["Installed", selected.dependencies?.version],
                    ["Fixed in", selected.vulnerabilities?.fixed_version],
                    ["Affected range", selected.vulnerabilities?.affected_versions],
                    ["Source", selected.vulnerabilities?.source],
                    [
                      "Exploit available",
                      selected.vulnerabilities?.exploit_available ? "Yes" : "No",
                    ],
                    ["Public PoC", selected.vulnerabilities?.public_poc ? "Yes" : "No"],
                    ["Runtime exposure", selected.runtime_exposure ? "Yes" : "No"],
                    [
                      "Internet facing",
                      selected.repositories?.internet_facing ? "Yes" : "No",
                    ],
                  ].map(([k, v]) => (
                    <div key={String(k)}>
                      <dt className="text-xs text-muted-foreground">{k}</dt>
                      <dd className="font-medium break-words">{v ?? "—"}</dd>
                    </div>
                  ))}
                </dl>

                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => triggerRemediation.mutate(selected)}
                    disabled={triggerRemediation.isPending || selected.status === "resolved"}
                  >
                    <Zap className="size-4" /> Start automated remediation
                  </Button>
                  <Button variant="outline" asChild>
                    <a
                      href={`https://osv.dev/vulnerability/${selected.vulnerabilities?.cve_id}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink className="size-4" /> Advisory
                    </a>
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </DashboardShell>
  );
}
