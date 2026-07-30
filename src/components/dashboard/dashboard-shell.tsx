import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  FileCheck2,
  GitPullRequest,
  LayoutDashboard,
  Network,
  Package,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const nav = [
  { label: "Overview", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Repositories", icon: Package },
  { label: "Vulnerabilities", icon: ShieldAlert },
  { label: "Blast radius", icon: Network },
  { label: "Pull requests", icon: GitPullRequest },
  { label: "Compliance", icon: FileCheck2 },
  { label: "Settings", icon: Settings },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border/70 bg-card/50 lg:flex">
        <Link to="/" className="flex h-16 items-center gap-2 border-b border-border/70 px-5">
          <span className="bg-brand flex size-7 items-center justify-center rounded-lg">
            <ShieldCheck className="size-3.5 text-primary-foreground" />
          </span>
          <span className="font-display text-sm font-bold">SentinelChain</span>
        </Link>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((item) => {
            const active = item.to === pathname;
            const cls = `flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`;
            return item.to ? (
              <Link key={item.label} to={item.to} className={cls}>
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ) : (
              <button key={item.label} type="button" className={cls}>
                <item.icon className="size-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-border/70 p-4 text-xs text-muted-foreground">
          Phase 1 shell · data wiring next
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border/70 bg-background/80 px-6 backdrop-blur-xl">
          <div className="relative max-w-md flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search repositories, packages, CVEs" className="pl-9" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="size-4" />
            </Button>
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">SC</AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}