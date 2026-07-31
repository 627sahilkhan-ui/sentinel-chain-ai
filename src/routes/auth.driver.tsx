import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Truck, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const title = "Driver Login — SentinelChain AI";
const description = "Sign in or register as a driver on SentinelChain AI platform.";

export const Route = createFileRoute("/auth/driver")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: DriverAuthPage,
});

function DriverAuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard/driver", replace: true });
    });
  }, [navigate]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setPending("signin");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setPending(null);
    if (error) return toast.error(error.message);
    navigate({ to: "/dashboard/driver", replace: true });
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setPending("signup");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard/driver`,
        data: {
          display_name: displayName,
          phone: phone,
          user_type: "driver",
        },
      },
    });
    setPending(null);
    if (error) return toast.error(error.message);
    toast.success("Check your inbox to confirm your email address.");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="grid-backdrop pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="bg-brand flex size-8 items-center justify-center rounded-lg">
            <ShieldCheck className="size-4 text-primary-foreground" />
          </span>
          <span className="font-display text-base font-bold">SentinelChain AI</span>
        </Link>

        <Card className="border-border/70">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <Truck className="size-5 text-primary" />
              <CardTitle className="font-display text-xl">Driver Portal</CardTitle>
            </div>
            <CardDescription>
              Sign in or create your driver account to manage deliveries and routes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-4">
                <form onSubmit={handleSignIn} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="driver-signin-email">Email</Label>
                    <Input
                      id="driver-signin-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="driver@example.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="driver-signin-password">Password</Label>
                    <Input
                      id="driver-signin-password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={pending !== null}>
                    {pending === "signin" && <Loader2 className="size-4 animate-spin" />}
                    Sign In as Driver
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-4">
                <form onSubmit={handleSignUp} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="driver-signup-name">Full Name</Label>
                    <Input
                      id="driver-signup-name"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="driver-signup-email">Email</Label>
                    <Input
                      id="driver-signup-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="driver@example.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="driver-signup-phone">Phone Number</Label>
                    <Input
                      id="driver-signup-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="driver-signup-password">Password</Label>
                    <Input
                      id="driver-signup-password"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={pending !== null}>
                    {pending === "signup" && <Loader2 className="size-4 animate-spin" />}
                    Create Driver Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="text-center text-sm text-muted-foreground">
              Are you a customer?{" "}
              <Link to="/auth/customer" className="text-primary hover:underline">
                Sign in here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
