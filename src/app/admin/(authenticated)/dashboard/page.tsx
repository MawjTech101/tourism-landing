import { createClient } from "@/lib/supabase/server";
import { getTenant } from "@/lib/tenant/config";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plane,
  Tag,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  Clock,
  Eye,
  Plus,
  Settings,
  FileText,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const tenant = await getTenant();

  let activeTrips = 0;
  let activeDeals = 0;
  let totalInquiries = 0;
  let monthInquiries = 0;
  let recentInquiries: Array<{
    id: string;
    name: string;
    phone: string;
    trip_title: string;
    created_at: string;
  }> = [];

  if (tenant) {
    const supabase = await createClient();

    const [tripsRes, dealsRes, inquiriesRes, monthRes, recentRes] =
      await Promise.all([
        supabase
          .from("trips")
          .select("id", { count: "exact", head: true })
          .eq("tenant_id", tenant.id)
          .eq("status", "active"),
        supabase
          .from("trips")
          .select("id", { count: "exact", head: true })
          .eq("tenant_id", tenant.id)
          .eq("status", "active")
          .eq("is_deal", true),
        supabase
          .from("inquiries")
          .select("id", { count: "exact", head: true })
          .eq("tenant_id", tenant.id),
        supabase
          .from("inquiries")
          .select("id", { count: "exact", head: true })
          .eq("tenant_id", tenant.id)
          .gte(
            "created_at",
            new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              1
            ).toISOString()
          ),
        supabase
          .from("inquiries")
          .select("id, name, phone, trip_title, created_at")
          .eq("tenant_id", tenant.id)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

    activeTrips = tripsRes.count || 0;
    activeDeals = dealsRes.count || 0;
    totalInquiries = inquiriesRes.count || 0;
    monthInquiries = monthRes.count || 0;
    recentInquiries = (recentRes.data as typeof recentInquiries) || [];
  }

  const stats = [
    {
      title: "Active Trips",
      value: activeTrips,
      description: "Published packages",
      icon: Plane,
      href: "/admin/trips",
      color: "from-blue-500/10 to-blue-600/10",
      iconColor: "text-blue-600",
    },
    {
      title: "Active Deals",
      value: activeDeals,
      description: "Current promotions",
      icon: Tag,
      href: "/admin/deals",
      color: "from-emerald-500/10 to-emerald-600/10",
      iconColor: "text-emerald-600",
    },
    {
      title: "Inquiries",
      value: monthInquiries,
      description: "This month",
      icon: MessageSquare,
      href: "/admin/inquiries",
      color: "from-violet-500/10 to-violet-600/10",
      iconColor: "text-violet-600",
    },
    {
      title: "Total Inquiries",
      value: totalInquiries,
      description: "All time",
      icon: TrendingUp,
      href: "/admin/inquiries",
      color: "from-amber-500/10 to-amber-600/10",
      iconColor: "text-amber-600",
    },
  ];

  const quickActions = [
    {
      title: "New Trip",
      description: "Create a trip package",
      icon: Plus,
      href: "/admin/trips/new",
      color: "bg-blue-500",
    },
    {
      title: "View Inquiries",
      description: "Check messages",
      icon: Eye,
      href: "/admin/inquiries",
      color: "bg-violet-500",
    },
    {
      title: "Edit Pages",
      description: "About & content",
      icon: FileText,
      href: "/admin/pages",
      color: "bg-emerald-500",
    },
    {
      title: "Settings",
      description: "Branding & config",
      icon: Settings,
      href: "/admin/settings",
      color: "bg-amber-500",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your travel agency
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="group relative overflow-hidden border-border/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/[0.03]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color}`}
                >
                  <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight stat-number">
                  {stat.value}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-[#51487E]/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent Inquiries */}
        <Card className="border-border/40 lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Recent Inquiries
              </CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Latest customer messages
              </p>
            </div>
            <Link
              href="/admin/inquiries"
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentInquiries.length > 0 ? (
              <div className="space-y-1">
                {recentInquiries.map((inquiry) => (
                  <div
                    key={inquiry.id}
                    className="flex items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#51487E]/10 to-[#AB4E83]/10">
                      <span className="text-sm font-semibold text-[#51487E]">
                        {inquiry.name?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {inquiry.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {inquiry.trip_title || inquiry.phone}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(inquiry.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">No inquiries yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Share your website to start receiving messages
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border/40 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Quick Actions
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Common tasks at a glance
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <div className="group flex flex-col items-center gap-3 rounded-xl border border-border/30 bg-background p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-border/60 hover:shadow-md">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${action.color} shadow-sm transition-transform group-hover:scale-105`}
                  >
                    <action.icon className="h-4.5 w-4.5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{action.title}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      {activeTrips === 0 && (
        <Card className="border-border/40 bg-gradient-to-br from-[#51487E]/[0.02] to-[#AB4E83]/[0.02]">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Getting Started
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Set up your travel agency website in 4 steps
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  step: "1",
                  title: "Configure Settings",
                  desc: "Logo, colors, and contact info",
                  href: "/admin/settings",
                },
                {
                  step: "2",
                  title: "Add Your First Trip",
                  desc: "Itinerary, hotels, and photos",
                  href: "/admin/trips/new",
                },
                {
                  step: "3",
                  title: "Create a Deal",
                  desc: "Feature promotions on your homepage",
                  href: "/admin/deals",
                },
                {
                  step: "4",
                  title: "Share Your Site",
                  desc: "Start receiving customer inquiries",
                  href: "/",
                },
              ].map((item) => (
                <Link key={item.step} href={item.href}>
                  <div className="group flex items-start gap-4 rounded-xl border border-border/30 bg-background p-4 transition-all hover:border-border/60 hover:shadow-sm">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#51487E] to-[#AB4E83] text-xs font-bold text-white shadow-sm">
                      {item.step}
                    </div>
                    <div>
                      <p className="text-sm font-semibold group-hover:text-[#51487E]">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en", { month: "short", day: "numeric" });
}
