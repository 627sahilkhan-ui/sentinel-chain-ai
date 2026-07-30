import {
  Boxes,
  FileCheck2,
  GitBranch,
  Network,
  Radar,
  ShieldAlert,
  Signature,
  Workflow,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Boxes,
    title: "Automatic SBOM",
    body: "CycloneDX and SPDX documents generated on every build, versioned with license and hash metadata.",
  },
  {
    icon: Radar,
    title: "Continuous CVE monitoring",
    body: "OSV.dev, NVD, and GitHub Security Advisories matched against your resolved dependency tree.",
  },
  {
    icon: Network,
    title: "Blast radius graph",
    body: "See which services, containers, and packages a single vulnerable transitive dep reaches.",
  },
  {
    icon: ShieldAlert,
    title: "Contextual risk engine",
    body: "CVSS, exploit maturity, internet exposure, runtime usage, and business criticality in one score.",
  },
  {
    icon: Workflow,
    title: "Automated remediation",
    body: "Nearest safe version resolved, tests and scans executed, then a reviewable PR with full diff.",
  },
  {
    icon: Signature,
    title: "Provenance & signing",
    body: "Cosign-signed attestations so every artifact can prove where it came from.",
  },
  {
    icon: FileCheck2,
    title: "Compliance reporting",
    body: "SLSA, NIST SSDF, ISO 27001, and SOC 2 evidence exported on a schedule.",
  },
  {
    icon: GitBranch,
    title: "Repo-native workflow",
    body: "Branch-aware scanning with policy gates that fail builds only when risk is real.",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold text-primary">Platform capabilities</p>
        <h2 className="mt-3 text-4xl font-bold">Supply chain security, end to end</h2>
        <p className="mt-4 text-muted-foreground">
          One control plane from inventory to fix — no spreadsheets, no triage backlog, no manual
          upgrade toil.
        </p>
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <Card key={f.title} className="shadow-card border-border/70 transition-shadow hover:shadow-elevated">
            <CardHeader>
              <span className="bg-accent text-accent-foreground flex size-9 items-center justify-center rounded-lg">
                <f.icon className="size-4.5" />
              </span>
              <CardTitle className="pt-3 text-base">{f.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{f.body}</CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}