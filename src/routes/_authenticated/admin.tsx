import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Users,
  Shield,
  Truck,
  User,
  Trash2,
  UserPlus,
  Search,
  RefreshCw,
  Crown,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const title = "Super Admin Panel — SentinelChain AI";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [{ title }, { property: "og:title", content: title }],
  }),
  component: SuperAdminPage,
});

interface UserWithRole {
  id: string;
  email: string | null;
  display_name: string | null;
  user_type: string | null;
  phone: string | null;
  created_at: string;
  roles: AppRole[];
}

function roleBadge(role: AppRole) {
  switch (role) {
    case "super_admin":
      return (
        <Badge className="bg-purple-500/10 text-purple-600 border-purple-200">Super Admin</Badge>
      );
    case "admin":
      return <Badge className="bg-red-500/10 text-red-600 border-red-200">Admin</Badge>;
    case "driver":
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">Driver</Badge>;
    case "customer":
      return <Badge className="bg-green-500/10 text-green-600 border-green-200">Customer</Badge>;
    case "analyst":
      return <Badge className="bg-orange-500/10 text-orange-600 border-orange-200">Analyst</Badge>;
    case "viewer":
      return <Badge variant="secondary">Viewer</Badge>;
    default:
      return <Badge variant="outline">{role}</Badge>;
  }
}

function SuperAdminPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Check if current user is super_admin
  useEffect(() => {
    async function checkAccess() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        navigate({ to: "/auth", replace: true });
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id);

      const userRoles = roles?.map((r) => r.role) || [];
      if (userRoles.includes("super_admin") || userRoles.includes("admin")) {
        setIsSuperAdmin(true);
        fetchUsers();
      } else {
        toast.error("Access denied. Super Admin privileges required.");
        navigate({ to: "/dashboard", replace: true });
      }
    }
    checkAccess();
  }, [navigate]);

  async function fetchUsers() {
    setLoading(true);
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) {
        toast.error("Failed to fetch users: " + profilesError.message);
        setLoading(false);
        return;
      }

      // Fetch all roles
      const { data: allRoles, error: rolesError } = await supabase.from("user_roles").select("*");

      if (rolesError) {
        toast.error("Failed to fetch roles: " + rolesError.message);
        setLoading(false);
        return;
      }

      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => ({
        id: profile.id,
        email: profile.email,
        display_name: profile.display_name,
        user_type: profile.user_type,
        phone: profile.phone,
        created_at: profile.created_at,
        roles: (allRoles || []).filter((r) => r.user_id === profile.id).map((r) => r.role),
      }));

      setUsers(usersWithRoles);
    } catch {
      toast.error("Failed to load users");
    }
    setLoading(false);
  }

  async function handleRoleChange(userId: string, newRole: AppRole) {
    // Remove existing roles and add new one
    const { error: deleteError } = await supabase.from("user_roles").delete().eq("user_id", userId);

    if (deleteError) {
      toast.error("Failed to update role: " + deleteError.message);
      return;
    }

    const { error: insertError } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role: newRole });

    if (insertError) {
      toast.error("Failed to assign role: " + insertError.message);
      return;
    }

    // Update profile user_type
    await supabase.from("profiles").update({ user_type: newRole }).eq("id", userId);

    toast.success("Role updated successfully");
    fetchUsers();
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm("Are you sure you want to remove this user? This action cannot be undone.")) {
      return;
    }

    // Delete from user_roles first
    await supabase.from("user_roles").delete().eq("user_id", userId);
    // Delete profile
    const { error } = await supabase.from("profiles").delete().eq("id", userId);

    if (error) {
      toast.error("Failed to delete user: " + error.message);
      return;
    }

    toast.success("User removed successfully");
    fetchUsers();
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !searchQuery ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery);

    const matchesRole = filterRole === "all" || user.roles.includes(filterRole as AppRole);

    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    drivers: users.filter((u) => u.roles.includes("driver")).length,
    customers: users.filter((u) => u.roles.includes("customer")).length,
    admins: users.filter((u) => u.roles.includes("admin") || u.roles.includes("super_admin"))
      .length,
  };

  if (!isSuperAdmin) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Checking access...</p>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="mb-6 flex items-center gap-3">
        <Crown className="size-6 text-purple-500" />
        <div>
          <h1 className="text-2xl font-bold">Super Admin Panel</h1>
          <p className="text-sm text-muted-foreground">
            Manage all users, roles, and platform access.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="shadow-card border-border/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Drivers</CardTitle>
            <Truck className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold">{stats.drivers}</p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Customers</CardTitle>
            <User className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold">{stats.customers}</p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Admins</CardTitle>
            <Shield className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold">{stats.admins}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 shadow-card border-border/70">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base">User Management</CardTitle>
            <Button size="sm" variant="outline" onClick={fetchUsers} disabled={loading}>
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="driver">Driver</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="analyst">Analyst</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="size-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading users...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No users found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.display_name || "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{user.email || "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{user.phone || "—"}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles.length > 0 ? (
                              user.roles.map((role) => <span key={role}>{roleBadge(role)}</span>)
                            ) : (
                              <Badge variant="outline">No role</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Select
                              onValueChange={(value) => handleRoleChange(user.id, value as AppRole)}
                            >
                              <SelectTrigger className="h-8 w-[120px] text-xs">
                                <SelectValue placeholder="Change role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="super_admin">Super Admin</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="driver">Driver</SelectItem>
                                <SelectItem value="customer">Customer</SelectItem>
                                <SelectItem value="analyst">Analyst</SelectItem>
                                <SelectItem value="viewer">Viewer</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
