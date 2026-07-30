import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/marketing/site-header";
import { Hero } from "@/components/marketing/hero";
import { Features } from "@/components/marketing/features";
import {
  Faq,
  Integrations,
  PlatformPreview,
  Pricing,
  SiteFooter,
  Testimonials,
  TrustedBy,
} from "@/components/marketing/sections";

const title = "SentinelChain AI — Secure Every Dependency";
const description =
  "AI-powered DevSecOps platform: automatic SBOMs, continuous CVE monitoring, blast radius analysis, and automated remediation pull requests.";

export const Route = createFileRoute("/")({
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
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Hero />
        <TrustedBy />
        <Features />
        <PlatformPreview />
        <Integrations />
        <Testimonials />
        <Pricing />
        <Faq />
      </main>
      <SiteFooter />
    </div>
  );
}
