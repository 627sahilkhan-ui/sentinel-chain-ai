import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";

const nav = [
  { label: "Features", href: "#features" },
  { label: "Platform", href: "#platform" },
  { label: "Integrations", href: "#integrations" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function SiteHeader() {
  const { user, loading } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="bg-brand flex size-8 items-center justify-center rounded-lg">
            <ShieldCheck className="size-4 text-primary-foreground" />
          </span>
          <span className="font-display text-base font-bold">SentinelChain AI</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="h-8 w-32" aria-hidden="true" />
          ) : user ? (
            <Button size="sm" asChild>
              <Link to="/dashboard">Go to console</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/auth">Start free</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}