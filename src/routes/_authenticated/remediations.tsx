import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, GitPullRequest, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { logAudit, remediationsQuery, statusTone, timeAgo } from "@/lib/security-data";

const title = "Automated remediation — SentinelChain AI";
const description =
  "Track dependency upgrade pipelines: build and test verification, pull requests and merge outcomes per finding.";

export const Route = createFileRoute("/_authenticated/remediations")({
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
  component: RemediationsPage,
});

function Check({ value }: { value: boolean | null }) {
  if (value === null) return <span className="text-xs text-muted-foreground">pending</span>;
  return value ? (
    <CheckCircle2 className="size-4 text-success" aria-label="passed" />
  ) : (
    <XCircle className="size-4 text-critical" aria-label="failed" />
  );
}

function RemediationsPage() {
  const qc = useQueryClient();
  const { data: rows = [], isLoading } = useQuery(remediationsQuery);

  const advance = useMutation({
    mutationFn: async (row: (typeof rows)[number]) => {
      const next =
        row.status === "pending"
          ? { status: "testing", build_passed: true }
          : row.status === "testing"
            ? {
                status: "pr_open",
                tests_passed: true,
                pull_request_url: `https://github.com/sentinelchain/${row.repositories?.name}/pull/${Math.floor(Math.random() * 900 + 100)}`,
              }
            : { status: "merged" };
      const { error } = await supabase.from("remediations").update(next).eq("id", row.id);
      if (error) throw new Error(error.message);
      if (next.status === "merged" && row.match_id) {
        await supabase
          .from("vulnerability_matches")
          .update({ status: "resolved" })
          .eq("id", row.match_id);
      }
      await logAudit(
        `remediation_${next.status}`,
        row.repositories?.name ?? "repository",
        `${row.package_name} ${row.old_version} → ${row.new_version}`,
      );
    },
    onSuccess: () => {
      toast.success("Remediation pipeline advanced.");
      qc.invalidateQueries({ queryKey: ["remediations"] });
      qc.invalidateQueries({ queryKey: ["matches"] });
      qc.invalidateQueries({ queryKey: ["audit_logs"] });
    },
    onError: () => toast.error("Only repository owners can advance this pipeline."),
  });

  const merged = rows.filter((r) => r.status === "merged").length;
  const active = rows.filter((r) => r.status !== "merged" && r.status !== "failed").length;

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Automated remediation</h1>
        <p className="text-sm text-muted-foreground">
          Modules 10–12 — upgrade proposals, verification gates and pull-request delivery.
        </p>
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        {[
          ["Total pipelines", rows.length, ""],
          ["In flight", active, "text-primary"],
          ["Merged fixes", merged, "text-success"],
        ].map(([label, value, tone]) => (
          <Card key={String(label)} className="shadow-card border-border/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`font-display text-3xl font-bold ${tone}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-card border-border/70">
        <CardHeader>
          <CardTitle className="text-base">Remediation pipelines</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading pipelines…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Repository</TableHead>
                  <TableHead>Upgrade</TableHead>
                  <TableHead>Build</TableHead>
                  <TableHead>Tests</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.repositories?.name}</TableCell>
                    <TableCell>
                      <div className="font-mono text-xs">{r.package_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {r.old_version} → {r.new_version}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Check value={r.build_passed} />
                    </TableCell>
                    <TableCell>
                      <Check value={r.tests_passed} />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusTone(r.status)}>
                        {r.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {timeAgo(r.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      {r.pull_request_url ? (
                        <Button size="sm" variant="ghost" asChild>
                          <a href={r.pull_request_url} target="_blank" rel="noreferrer">
                            <GitPullRequest className="size-4" /> PR
                          </a>
                        </Button>
                      ) : null}
                      {r.status !== "merged" && r.status !== "failed" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => advance.mutate(r)}
                          disabled={advance.isPending}
                        >
                          {advance.isPending && <Loader2 className="size-4 animate-spin" />}
                          Advance
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
