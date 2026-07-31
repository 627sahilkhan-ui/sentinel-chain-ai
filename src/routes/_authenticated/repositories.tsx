import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GitBranch, Loader2, Plus, ShieldCheck, Trash2, Webhook } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { logAudit, repositoriesQuery, severityTone, timeAgo } from "@/lib/security-data";

const title = "Repositories — SentinelChain AI";
const description =
  "Onboard GitHub, GitLab and Bitbucket repositories, configure webhooks and monitor supply-chain health per project.";

export const Route = createFileRoute("/_authenticated/repositories")({
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
  component: RepositoriesPage,
});

function healthTone(score: number) {
  if (score >= 85) return "text-success";
  if (score >= 70) return "text-warning";
  return "text-critical";
}

function RepositoriesPage() {
  const { user } = useSession();
  const qc = useQueryClient();
  const { data: repos = [], isLoading } = useQuery(repositoriesQuery);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    owner: "",
    provider: "github",
    default_branch: "main",
    language: "TypeScript",
    criticality: "medium",
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("repositories").insert({
        ...form,
        owner_id: user?.id ?? null,
        health_score: 100,
        webhook_status: "pending",
      });
      if (error) throw new Error(error.message);
      await logAudit("repository_onboarded", form.name, `Registered ${form.owner}/${form.name} for continuous monitoring`);
    },
    onSuccess: () => {
      toast.success("Repository onboarded — webhook verification queued.");
      setOpen(false);
      setForm({ ...form, name: "", owner: "" });
      qc.invalidateQueries({ queryKey: ["repositories"] });
      qc.invalidateQueries({ queryKey: ["audit_logs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("repositories").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Repository removed from monitoring.");
      qc.invalidateQueries({ queryKey: ["repositories"] });
    },
    onError: () => toast.error("You can only remove repositories you onboarded."),
  });

  return (
    <DashboardShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Repositories</h1>
          <p className="text-sm text-muted-foreground">
            Module 1 — connect providers, verify webhooks and track per-repository health.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4" /> Onboard repository
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Onboard a repository</DialogTitle>
              <DialogDescription>
                Registration completes in under five minutes; a webhook is provisioned for the
                monitored branch.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="repo-owner">Organization</Label>
                <Input
                  id="repo-owner"
                  value={form.owner}
                  onChange={(e) => setForm({ ...form, owner: e.target.value })}
                  placeholder="acme"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="repo-name">Repository</Label>
                <Input
                  id="repo-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="payments-core"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Provider</Label>
                <Select
                  value={form.provider}
                  onValueChange={(v) => setForm({ ...form, provider: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="github">GitHub</SelectItem>
                    <SelectItem value="gitlab">GitLab</SelectItem>
                    <SelectItem value="bitbucket">Bitbucket</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="repo-branch">Monitored branch</Label>
                <Input
                  id="repo-branch"
                  value={form.default_branch}
                  onChange={(e) => setForm({ ...form, default_branch: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="repo-lang">Language</Label>
                <Input
                  id="repo-lang"
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Business criticality</Label>
                <Select
                  value={form.criticality}
                  onValueChange={(v) => setForm({ ...form, criticality: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => create.mutate()}
                disabled={!form.name || !form.owner || create.isPending}
              >
                {create.isPending && <Loader2 className="size-4 animate-spin" />}
                Register repository
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-card border-border/70">
        <CardHeader>
          <CardTitle className="text-base">Monitored repositories ({repos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading repositories…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Repository</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Criticality</TableHead>
                  <TableHead>Webhook</TableHead>
                  <TableHead>Health</TableHead>
                  <TableHead>Last build</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {repos.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="font-medium">
                        {r.owner}/{r.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {r.language}
                        {r.internet_facing ? " · internet-facing" : ""}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize text-muted-foreground">{r.provider}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <GitBranch className="size-3.5" />
                        {r.default_branch}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={severityTone(r.criticality)}>
                        {r.criticality}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`flex items-center gap-1.5 text-xs ${
                          r.webhook_status === "active" ? "text-success" : "text-warning"
                        }`}
                      >
                        <Webhook className="size-3.5" />
                        {r.webhook_status}
                      </span>
                    </TableCell>
                    <TableCell className="w-40">
                      <div className="flex items-center gap-2">
                        <Progress value={r.health_score} className="h-1.5" />
                        <span className={`text-xs font-semibold ${healthTone(r.health_score)}`}>
                          {r.health_score}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {timeAgo(r.last_build_at)}
                    </TableCell>
                    <TableCell>
                      {r.owner_id === user?.id ? (
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={`Remove ${r.name}`}
                          onClick={() => remove.mutate(r.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      ) : (
                        <ShieldCheck className="size-4 text-muted-foreground" aria-label="Managed demo repository" />
                      )}
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
