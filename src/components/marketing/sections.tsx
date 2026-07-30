import { Link } from "@tanstack/react-router";
import { Check, Quote, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function TrustedBy() {
  const logos = ["Northwind", "Aeris Bank", "Volta Health", "Kepler Labs", "Onyx Retail", "Meridian"];
  return (
    <section className="border-y border-border/70 bg-card/50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-center text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Trusted by security teams shipping at scale
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          {logos.map((l) => (
            <span key={l} className="font-display text-lg font-semibold text-muted-foreground/70">
              {l}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PlatformPreview() {
  const rows = [
    { pkg: "lodash@4.17.20", sev: "Critical", cve: "CVE-2021-23337", fix: "4.17.21" },
    { pkg: "axios@1.5.0", sev: "High", cve: "CVE-2024-28849", fix: "1.7.4" },
    { pkg: "express@4.17.1", sev: "Medium", cve: "CVE-2024-29041", fix: "4.19.2" },
    { pkg: "tar@6.1.9", sev: "High", cve: "CVE-2021-37713", fix: "6.1.11" },
  ];
  const tone: Record<string, string> = {
    Critical: "bg-critical/12 text-critical",
    High: "bg-warning/15 text-warning",
    Medium: "bg-primary/10 text-primary",
  };
  return (
    <section id="platform" className="border-y border-border/70 bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-semibold text-primary">Live console</p>
          <h2 className="mt-3 text-4xl font-bold">From detection to merged fix in minutes</h2>
          <p className="mt-4 text-muted-foreground">
            Every finding arrives with the exploit path, the affected services, and a pull request
            that already passed your test suite. Analysts review context, not raw scanner output.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "Deduplicated findings across every repo and container image",
              "Reachability analysis so unused code paths stay out of the queue",
              "Policy gates wired into CI with signed attestations",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5">
                <Check className="mt-0.5 size-4 text-success" />
                <span className="text-muted-foreground">{t}</span>
              </li>
            ))}
          </ul>
          <Button className="mt-8" asChild>
            <Link to="/dashboard">Explore the dashboard</Link>
          </Button>
        </div>
        <Card className="shadow-elevated overflow-hidden border-border/70">
          <CardHeader className="border-b border-border/70">
            <CardTitle className="flex items-center gap-2 text-sm">
              <ShieldCheck className="size-4 text-primary" /> Prioritized findings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {rows.map((r) => (
              <div
                key={r.cve}
                className="flex items-center justify-between gap-4 border-b border-border/60 px-5 py-4 text-sm last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{r.pkg}</p>
                  <p className="text-xs text-muted-foreground">{r.cve}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone[r.sev]}`}>
                    {r.sev}
                  </span>
                  <span className="hidden text-xs text-muted-foreground sm:block">
                    fix → {r.fix}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export function Integrations() {
  const items = [
    "GitHub",
    "GitLab",
    "Bitbucket",
    "Jenkins",
    "Docker Hub",
    "Kubernetes",
    "Slack",
    "Jira",
    "PagerDuty",
    "Snyk import",
    "AWS ECR",
    "Azure DevOps",
  ];
  return (
    <section id="integrations" className="mx-auto max-w-7xl px-6 py-24">
      <div className="text-center">
        <h2 className="text-4xl font-bold">Fits the toolchain you already run</h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Connect a source, and SentinelChain indexes the dependency graph within minutes.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((i) => (
          <div
            key={i}
            className="shadow-card rounded-xl border border-border/70 bg-card px-4 py-6 text-center text-sm font-medium"
          >
            {i}
          </div>
        ))}
      </div>
    </section>
  );
}

export function Testimonials() {
  const quotes = [
    {
      q: "We cut mean time to remediate from 34 days to under 48 hours. The PRs just show up, green.",
      n: "Priya Raman",
      r: "VP Platform Security, Aeris Bank",
    },
    {
      q: "The blast radius view ended the argument about which teams actually had to patch.",
      n: "Daniel Okoye",
      r: "Director of Engineering, Volta Health",
    },
    {
      q: "Our SOC 2 evidence pack is now a scheduled export instead of a two-week fire drill.",
      n: "Lena Fischer",
      r: "Head of Compliance, Kepler Labs",
    },
  ];
  return (
    <section className="border-y border-border/70 bg-card/40">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <h2 className="text-center text-4xl font-bold">Built for teams under audit</h2>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {quotes.map((t) => (
            <Card key={t.n} className="shadow-card border-border/70">
              <CardContent className="pt-6">
                <Quote className="size-5 text-primary" />
                <p className="mt-4 text-sm leading-relaxed">{t.q}</p>
                <p className="mt-6 text-sm font-semibold">{t.n}</p>
                <p className="text-xs text-muted-foreground">{t.r}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Pricing() {
  const tiers = [
    {
      name: "Starter",
      price: "$0",
      note: "up to 5 repositories",
      features: ["SBOM generation", "CVE monitoring", "Weekly reports", "Community support"],
      cta: "Start free",
      featured: false,
    },
    {
      name: "Growth",
      price: "$499",
      note: "per month, 50 repositories",
      features: [
        "Everything in Starter",
        "Blast radius graph",
        "Automated remediation PRs",
        "Risk engine & policy gates",
        "SSO and RBAC",
      ],
      cta: "Start 14-day trial",
      featured: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      note: "unlimited repositories",
      features: [
        "Everything in Growth",
        "Cosign provenance & SLSA L3",
        "Compliance evidence automation",
        "Private deployment options",
        "Dedicated architect",
      ],
      cta: "Book demo",
      featured: false,
    },
  ];
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
      <div className="text-center">
        <h2 className="text-4xl font-bold">Straightforward pricing</h2>
        <p className="mt-4 text-muted-foreground">Scale by repositories, not by seat count.</p>
      </div>
      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        {tiers.map((t) => (
          <Card
            key={t.name}
            className={
              t.featured
                ? "shadow-elevated relative border-primary/50"
                : "shadow-card border-border/70"
            }
          >
            {t.featured && (
              <Badge className="absolute -top-3 left-6">Most popular</Badge>
            )}
            <CardHeader>
              <CardTitle className="text-base">{t.name}</CardTitle>
              <p className="font-display pt-2 text-4xl font-bold">{t.price}</p>
              <p className="text-xs text-muted-foreground">{t.note}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 size-4 text-success" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="mt-6 w-full"
                variant={t.featured ? "default" : "outline"}
                asChild
              >
                <Link to="/dashboard">{t.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function Faq() {
  const faqs = [
    {
      q: "How does SentinelChain generate SBOMs?",
      a: "On each sync we resolve the full transitive dependency tree per manifest and emit both CycloneDX and SPDX documents, versioned with license, hash, and provenance metadata.",
    },
    {
      q: "Which vulnerability sources are used?",
      a: "OSV.dev, the NVD, and GitHub Security Advisories are polled continuously and normalized, then matched against resolved package versions rather than declared ranges.",
    },
    {
      q: "Are remediation pull requests safe to merge?",
      a: "Every PR upgrades to the nearest non-vulnerable version, runs your existing test suite plus a fresh scan, and includes the full diff and logs for review before merge.",
    },
    {
      q: "Can we self-host?",
      a: "Enterprise plans support private deployment in your own cloud account with customer-managed encryption keys.",
    },
  ];
  return (
    <section id="faq" className="border-t border-border/70 bg-card/40">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <h2 className="text-center text-4xl font-bold">Frequently asked questions</h2>
        <Accordion type="single" collapsible className="mt-10">
          {faqs.map((f) => (
            <AccordionItem key={f.q} value={f.q}>
              <AccordionTrigger className="text-left text-base">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export function SiteFooter() {
  const cols = [
    { title: "Product", links: ["Features", "Pricing", "Integrations", "Changelog"] },
    { title: "Company", links: ["About", "Careers", "Security", "Contact"] },
    { title: "Resources", links: ["Docs", "API reference", "Status", "Blog"] },
  ];
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-brand flex size-8 items-center justify-center rounded-lg">
              <ShieldCheck className="size-4 text-primary-foreground" />
            </span>
            <span className="font-display font-bold">SentinelChain AI</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Secure every dependency. Automate every fix.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <p className="text-sm font-semibold">{c.title}</p>
            <ul className="mt-4 space-y-2.5">
              {c.links.map((l) => (
                <li key={l}>
                  <span className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                    {l}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/70 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} SentinelChain AI. All rights reserved.
      </div>
    </footer>
  );
}