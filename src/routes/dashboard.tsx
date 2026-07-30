import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  GitPullRequest,
  Package,
  ShieldAlert,
  Boxes,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const title = "Security overview — SentinelChain AI";
const description =
  "Repository coverage, SBOM inventory, critical CVEs, risk score trend, and remediation pull requests in one console.";

export const Route = createFileRoute("/dashboard")({
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
  component: DashboardPage,
});

const metrics = [
  { label: "Repositories", value: "128", delta: "+6", up: true, icon: Package },
  { label: "SBOMs generated", value: "1,904", delta: "+212", up: true, icon: Boxes },
  { label: "Critical CVEs", value: "17", delta: "-9", up: false, icon: ShieldAlert },
  { label: "Open fix PRs", value: "23", delta: "+4", up: true, icon: GitPullRequest },
];

const riskTrend = [
  { week: "W1", risk: 74, resolved: 12 },
  { week: "W2", risk: 69, resolved: 18 },
  { week: "W3", risk: 63, resolved: 25 },
  { week: "W4", risk: 58, resolved: 31 },
  { week: "W5", risk: 49, resolved: 40 },
  { week: "W6", risk: 41, resolved: 47 },
];

const severity = [
  { name: "Critical", count: 17 },
  { name: "High", count: 54 },
  { name: "Medium", count: 132 },
  { name: "Low", count: 218 },
];

const repos = [
  { name: "payments-core", lang: "TypeScript", branch: "main", score: 92, crit: 0, build: "2m ago" },
  { name: "ledger-service", lang: "Go", branch: "main", score: 78, crit: 2, build: "18m ago" },
  { name: "identity-gateway", lang: "Java", branch: "release/4.2", score: 61, crit: 5, build: "1h ago" },
  { name: "web-console", lang: "TypeScript", branch: "main", score: 88, crit: 1, build: "3h ago" },
  { name: "risk-worker", lang: "Python", branch: "main", score: 70, crit: 3, build: "5h ago" },
];

const activity = [
  { t: "4m", text: "PR #482 opened — bump axios 1.5.0 → 1.7.4 in payments-core" },
  { t: "26m", text: "SBOM v218 signed with Cosign for ledger-service" },
  { t: "1h", text: "New critical advisory GHSA-8xk2 matched in identity-gateway" },
  { t: "3h", text: "Compliance export (SOC 2) delivered to security@acme.com" },
];

function scoreTone(score: number) {
  if (score >= 85) return "text-success";
  if (score >= 70) return "text-warning";
  return "text-critical";
}

function DashboardPage() {
  return (
    <DashboardShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Security overview</h1>
          <p className="text-sm text-muted-foreground">
            Organization-wide posture across 128 connected repositories.
          </p>
        </div>
        <Badge variant="secondary" className="gap-1.5">
          <span className="size-1.5 rounded-full bg-success" /> Last sync 2 minutes ago
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label} className="shadow-card border-border/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {m.label}
              </CardTitle>
              <m.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl font-bold">{m.value}</p>
              <p
                className={`mt-1 flex items-center gap-1 text-xs ${m.up ? "text-success" : "text-critical"}`}
              >
                {m.up ? (
                  <ArrowUpRight className="size-3.5" />
                ) : (
                  <ArrowDownRight className="size-3.5" />
                )}
                {m.delta} vs last week
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="shadow-card border-border/70 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Risk score vs. remediations</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskTrend}>
                <defs>
                  <linearGradient id="risk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--popover-foreground)",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="risk"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="url(#risk)"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  stroke="var(--success)"
                  strokeWidth={2}
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/70">
          <CardHeader>
            <CardTitle className="text-base">Findings by severity</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severity}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: "var(--muted)" }}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--popover-foreground)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="shadow-card border-border/70 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Repository health</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Repository</TableHead>
                  <TableHead className="hidden md:table-cell">Language</TableHead>
                  <TableHead className="hidden md:table-cell">Branch</TableHead>
                  <TableHead>Critical</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="hidden sm:table-cell">Last build</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {repos.map((r) => (
                  <TableRow key={r.name}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {r.lang}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {r.branch}
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.crit > 0 ? "destructive" : "secondary"}>{r.crit}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={r.score} className="h-1.5 w-16" />
                        <span className={`text-xs font-semibold ${scoreTone(r.score)}`}>
                          {r.score}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {r.build}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/70">
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activity.map((a) => (
              <div key={a.text} className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <div>
                  <p className="text-sm leading-snug">{a.text}</p>
                  <p className="text-xs text-muted-foreground">{a.t} ago</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}