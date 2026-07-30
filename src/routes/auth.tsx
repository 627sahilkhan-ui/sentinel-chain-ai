import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Loader2, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const title = "Sign in — SentinelChain AI";
const description =
  "Access your SentinelChain AI security console with email, a magic link, or Google single sign-on.";

function sanitizeRedirect(value: unknown) {
  if (typeof value !== "string") return "/dashboard";
  if (!value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: sanitizeRedirect(search.redirect),
  }),
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
  component: AuthPage,
});

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24Z"
      />
      <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.6V6.7H1.4a12 12 0 0 0 0 10.8l4-3.1Z" />
      <path
        fill="#EA4335"
        d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.7l4 3.1C6.3 6.9 8.9 4.8 12 4.8Z"
      />
    </svg>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const destination = sanitizeRedirect(search.redirect);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [magicEmail, setMagicEmail] = useState("");
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: destination, replace: true });
    });
  }, [destination, navigate]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setPending("signin");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setPending(null);
    if (error) return toast.error(error.message);
    navigate({ to: destination, replace: true });
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setPending("signup");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}${destination}`,
        data: { display_name: displayName },
      },
    });
    setPending(null);
    if (error) return toast.error(error.message);
    toast.success("Check your inbox to confirm your email address.");
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setPending("magic");
    const { error } = await supabase.auth.signInWithOtp({
      email: magicEmail,
      options: { emailRedirectTo: `${window.location.origin}${destination}` },
    });
    setPending(null);
    if (error) return toast.error(error.message);
    toast.success("Magic link sent — check your inbox.");
  }

  async function handleGoogle() {
    setPending("google");
    sessionStorage.setItem("sc_auth_redirect", destination);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setPending(null);
      return toast.error("Google sign-in failed. Please try again.");
    }
    if (result.redirected) return;
    setPending(null);
    navigate({ to: destination, replace: true });
  }

  async function handleReset() {
    if (!email) return toast.error("Enter your email address first.");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return toast.error(error.message);
    toast.success("Password reset link sent.");
  }

  return (
    <main className="grid-backdrop flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="bg-brand flex size-8 items-center justify-center rounded-lg">
            <ShieldCheck className="size-4 text-primary-foreground" />
          </span>
          <span className="font-display text-base font-bold">SentinelChain AI</span>
        </Link>

        <Card className="border-border/70">
          <CardHeader className="space-y-1">
            <CardTitle className="font-display text-xl">Welcome back</CardTitle>
            <CardDescription>
              Sign in to your security console. Enterprise SSO available on request.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogle}
              disabled={pending !== null}
            >
              {pending === "google" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/70" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-2 text-xs text-muted-foreground uppercase">or</span>
              </div>
            </div>

            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
                <TabsTrigger value="magic">Magic link</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-4">
                <form onSubmit={handleSignIn} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="signin-email">Work email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={pending !== null}>
                    {pending === "signin" && <Loader2 className="size-4 animate-spin" />}
                    Sign in
                  </Button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Forgot your password?
                  </button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-4">
                <form onSubmit={handleSignUp} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-name">Full name</Label>
                    <Input
                      id="signup-name"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Ada Lovelace"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-email">Work email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
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
                    Create account
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="magic" className="mt-4">
                <form onSubmit={handleMagicLink} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="magic-email">Work email</Label>
                    <Input
                      id="magic-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={magicEmail}
                      onChange={(e) => setMagicEmail(e.target.value)}
                      placeholder="you@company.com"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={pending !== null}>
                    {pending === "magic" ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Mail className="size-4" />
                    )}
                    Email me a magic link
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    No password needed — the link signs you in for this device.
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing you agree to the SentinelChain AI terms and privacy policy.
        </p>
      </div>
    </main>
  );
}