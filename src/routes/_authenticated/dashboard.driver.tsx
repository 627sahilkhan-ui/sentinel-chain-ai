import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Truck, MapPin, Clock, CheckCircle2, Package, Navigation } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const title = "Driver Dashboard — SentinelChain AI";

export const Route = createFileRoute("/_authenticated/dashboard/driver")({
  head: () => ({
    meta: [{ title }, { property: "og:title", content: title }],
  }),
  component: DriverDashboardPage,
});

const mockDeliveries = [
  {
    id: "DEL-001",
    customer: "Rahul Sharma",
    address: "MG Road, Bangalore",
    status: "in_transit",
    eta: "15 min",
  },
  {
    id: "DEL-002",
    customer: "Priya Patel",
    address: "Koramangala, Bangalore",
    status: "pending",
    eta: "45 min",
  },
  {
    id: "DEL-003",
    customer: "Amit Kumar",
    address: "Whitefield, Bangalore",
    status: "delivered",
    eta: "—",
  },
  {
    id: "DEL-004",
    customer: "Sneha Reddy",
    address: "Indiranagar, Bangalore",
    status: "pending",
    eta: "1h 20min",
  },
];

function statusBadge(status: string) {
  switch (status) {
    case "in_transit":
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">In Transit</Badge>;
    case "pending":
      return <Badge variant="secondary">Pending</Badge>;
    case "delivered":
      return <Badge className="bg-green-500/10 text-green-600 border-green-200">Delivered</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function DriverDashboardPage() {
  const [profile, setProfile] = useState<{ display_name: string | null } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase
          .from("profiles")
          .select("display_name")
          .eq("id", data.user.id)
          .maybeSingle()
          .then(({ data: p }) => setProfile(p));
      }
    });
  }, []);

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Welcome, {profile?.display_name || "Driver"} 🚚</h1>
        <p className="text-sm text-muted-foreground">
          Manage your deliveries and routes from here.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="shadow-card border-border/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Deliveries
            </CardTitle>
            <Package className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold">12</p>
            <p className="mt-1 text-xs text-muted-foreground">4 completed</p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Transit</CardTitle>
            <Truck className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold">3</p>
            <p className="mt-1 text-xs text-blue-500">Currently active</p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Delivery Time
            </CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold">28m</p>
            <p className="mt-1 text-xs text-green-500">-5m from yesterday</p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed Today
            </CardTitle>
            <CheckCircle2 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold">4</p>
            <p className="mt-1 text-xs text-green-500">On track</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 shadow-card border-border/70">
        <CardHeader>
          <CardTitle className="text-base">Active Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockDeliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="flex items-center justify-between rounded-lg border border-border/70 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                    <MapPin className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{delivery.customer}</p>
                    <p className="text-xs text-muted-foreground">{delivery.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {statusBadge(delivery.status)}
                  <span className="text-xs text-muted-foreground">{delivery.eta}</span>
                  {delivery.status === "in_transit" && (
                    <Button size="sm" variant="outline" className="gap-1">
                      <Navigation className="size-3" />
                      Navigate
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
