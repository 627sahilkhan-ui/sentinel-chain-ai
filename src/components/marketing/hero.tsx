import { Link } from "@tanstack/react-router";
import { ArrowRight, GitPullRequest, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="bg-hero relative overflow-hidden">
      <div className="grid-backdrop pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-20 text-center">
        <Badge variant="secondary" className="mb-6 gap-1.5 rounded-full px-3 py-1">
          <Sparkles className="size-3.5" />
          AI remediation now generates signed pull requests
        </Badge>
        <h1 className="mx-auto max-w-4xl text-5xl leading-[1.05] font-bold md:text-6xl">
          Know Every Dependency.
          <br />
          <span className="text-brand">Stop Every Vulnerability.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          SentinelChain AI continuously generates SBOMs, monitors global CVE feeds, maps blast
          radius across your services, and ships the fix as a tested pull request.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link to="/dashboard">
              Start free <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#platform">Book demo</a>
          </Button>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="size-3.5" /> SLSA Level 3 provenance
          </span>
          <span className="inline-flex items-center gap-1.5">
            <GitPullRequest className="size-3.5" /> 14-day trial, no card
          </span>
          <span>SOC 2 Type II · ISO 27001</span>
        </div>
      </div>
    </section>
  );
}