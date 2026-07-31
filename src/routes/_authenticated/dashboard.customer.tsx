import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package, Truck, Clock, MapPin, Star, ShoppingBag } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

const title = "Customer Dashboard — SentinelChain AI";

export const Route = createFileRoute("/_authenticated/dashboard/customer")({
  head: () => ({
    meta: [{ title }, { property: "og:title", content: title }],
  }),
  component: CustomerDashboardPage,
});

const mockOrders = [
  {
    id: "ORD-1001",
    item: "Electronics Package",
    status: "in_transit",
    progress: 65,
    driver: "Rajesh K.",
    eta: "Today, 3:00 PM",
  },
  {
    id: "ORD-1002",
    item: "Grocery Delivery",
    status: "out_for_delivery",
    progress: 90,
    driver: "Suresh M.",
    eta: "Today, 1:30 PM",
  },
  {
    id: "ORD-1003",
    item: "Document Courier",
    status: "delivered",
    progress: 100,
    driver: "Anil P.",
    eta: "Delivered",
  },
  {
    id: "ORD-1004",
    item: "Furniture Set",
    status: "processing",
    progress: 20,
    driver: "Pending",
    eta: "Tomorrow",
  },
];

function statusBadge(status: string) {
  switch (status) {
    case "in_transit":
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">In Transit</Badge>;
    case "out_for_delivery":
      return (
        <Badge className="bg-orange-500/10 text-orange-600 border-orange-200">
          Out for Delivery
        </Badge>
      );
    case "delivered":
      return <Badge className="bg-green-500/10 text-green-600 border-green-200">Delivered</Badge>;
    case "processing":
      return <Badge variant="secondary">Processing</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function CustomerDashboardPage() {
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
        <h1 className="text-2xl font-bold">Welcome, {profile?.display_name || "Customer"} 👋</h1>
        <p className="text-sm text-muted-foreground">Track your orders and manage shipments.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="shadow-card border-border/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Orders
            </CardTitle>
            <ShoppingBag className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold">3</p>
            <p className="mt-1 text-xs text-muted-foreground">1 arriving today</p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Transit</CardTitle>
            <Truck className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold">2</p>
            <p className="mt-1 text-xs text-blue-500">On the way</p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Delivered
            </CardTitle>
            <Package className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold">47</p>
            <p className="mt-1 text-xs text-green-500">All time</p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Rating Given
            </CardTitle>
            <Star className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold">4.8</p>
            <p className="mt-1 text-xs text-muted-foreground">Out of 5</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 shadow-card border-border/70">
        <CardHeader>
          <CardTitle className="text-base">Your Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockOrders.map((order) => (
              <div key={order.id} className="rounded-lg border border-border/70 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                      <Package className="size-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{order.item}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.id} • Driver: {order.driver}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">{statusBadge(order.status)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={order.progress} className="h-2 flex-1" />
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    {order.eta}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
