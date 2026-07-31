import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Download, FileJson, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  dependenciesQuery,
  downloadJson,
  sbomsQuery,
  timeAgo,
} from "@/lib/security-data";

const title = "SBOM & provenance — SentinelChain AI";
const description =
  "CycloneDX software bills of materials, signature verification and per-package provenance attestation for every build.";

export const Route = createFileRoute("/_authenticated/sboms")({
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
  component: SbomPage,
});

function provenanceTone(status: string) {
  if (status === "verified") return "bg-success/15 text-success border-success/30";
  if (status === "failed") return "bg-critical/15 text-critical border-critical/30";
  return "bg-warning/15 text-warning border-warning/30";
}

function SbomPage() {
  const { data: sboms = [] } = useQuery(sbomsQuery);
  const { data: deps = [] } = useQuery(dependenciesQuery);
  const [q, setQ] = useState("");

  const filteredDeps = useMemo(
    () =>
      deps.filter((d) =>
        `${d.package_name} ${d.license} ${d.repositories?.name}`
          .toLowerCase()
          .includes(q.toLowerCase()),
      ),
    [deps, q],
  );

  const verified = sboms.filter((s) => s.verified).length;
  const unverifiedDeps = deps.filter((d) => d.provenance_status !== "verified").length;

  function exportSbom(id: string, repo: string) {
    const sbom = sboms.find((s) => s.id === id);
    const components = deps.filter((d) => d.sbom_id === id);
    downloadJson(`sbom-${repo}-${sbom?.build_number}.json`, {
      bomFormat: "CycloneDX",
      specVersion: "1.5",
      version: 1,
      metadata: {
        timestamp: sbom?.generated_at,
        component: { type: "application", name: repo },
        properties: [
          { name: "build", value: sbom?.build_number },
          { name: "commit", value: sbom?.commit_hash },
          { name: "signature", value: sbom?.signature },
        ],
      },
      components: components.map((c) => ({
        type: "library",
        name: c.package_name,
        version: c.version,
        licenses: c.license ? [{ license: { id: c.license } }] : [],
        hashes: c.checksum ? [{ alg: "SHA-256", content: c.checksum }] : [],
        properties: [{ name: "provenance", value: c.provenance_status }],
      })),
    });
    toast.success("CycloneDX SBOM exported.");
  }

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">SBOM &amp; provenance</h1>
        <p className="text-sm text-muted-foreground">
          Modules 2–3 — signed bills of materials and provenance verification per component.
        </p>
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <Card className="shadow-card border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              SBOMs generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold">{sboms.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Signature verified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold text-success">
              {verified}/{sboms.length}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Components lacking provenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold text-warning">{unverifiedDeps}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sboms">
        <TabsList>
          <TabsTrigger value="sboms">Build SBOMs</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
        </TabsList>

        <TabsContent value="sboms" className="mt-4">
          <Card className="shadow-card border-border/70">
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Repository</TableHead>
                    <TableHead>Build</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Components</TableHead>
                    <TableHead>Signature</TableHead>
                    <TableHead>Generated</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sboms.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.repositories?.name}</TableCell>
                      <TableCell>
                        <div className="text-sm">{s.build_number}</div>
                        <div className="font-mono text-xs text-muted-foreground">
                          {s.commit_hash?.slice(0, 10)} · {s.branch}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{s.format}</TableCell>
                      <TableCell className="text-sm">{s.component_count}</TableCell>
                      <TableCell>
                        {s.verified ? (
                          <span className="flex items-center gap-1.5 text-xs text-success">
                            <BadgeCheck className="size-3.5" /> verified
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs text-warning">
                            <ShieldAlert className="size-3.5" /> unsigned
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {timeAgo(s.generated_at)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => exportSbom(s.id, s.repositories?.name ?? "repo")}
                        >
                          <FileJson className="size-4" /> Export
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="mt-4">
          <Card className="shadow-card border-border/70">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base">
                Tracked components ({filteredDeps.length})
              </CardTitle>
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search package, license, repo"
                className="w-64"
              />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Repository</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>License</TableHead>
                    <TableHead>Provenance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeps.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-mono text-xs">{d.package_name}</TableCell>
                      <TableCell className="text-sm">{d.version}</TableCell>
                      <TableCell className="text-sm">{d.repositories?.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {d.is_direct ? "direct" : "transitive"}
                      </TableCell>
                      <TableCell className="text-sm">{d.license ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={provenanceTone(d.provenance_status)}>
                          {d.provenance_status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
