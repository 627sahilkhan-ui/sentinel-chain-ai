import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
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
  LogOut,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";

const nav = [
  { label: "Overview", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Driver Panel", icon: Package, to: "/dashboard/driver" },
  { label: "Customer Panel", icon: FileCheck2, to: "/dashboard/customer" },
  { label: "Repositories", icon: Package },
  { label: "Vulnerabilities", icon: ShieldAlert },
  { label: "Blast radius", icon: Network },
  { label: "Pull requests", icon: GitPullRequest },
  { label: "Admin Panel", icon: Settings, to: "/admin" },
  { label: "Settings", icon: Settings },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<{
    display_name: string | null;
    avatar_url: string | null;
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setProfile(data ?? null);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const name = profile?.display_name ?? user?.email ?? "Account";
  const initials = name.slice(0, 2).toUpperCase();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" aria-label="Account menu" className="rounded-full">
                  <Avatar className="size-8">
                    {profile?.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} alt={name} />
                    ) : null}
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate font-normal">
                  <span className="block text-sm font-medium">{name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {user?.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleSignOut}>
                  <LogOut className="size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
