import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Users, Clock, FolderKanban, Smartphone, Globe, Palette,
  Film, Megaphone, Shield, Plus, ArrowRight, Activity as ActivityIcon,
  Inbox, Tags, Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell, CartesianGrid,
} from "recharts";
import { dashboardApi } from "@/services/api";
import { usePendingRequestCount } from "@/hooks/usePendingRequestCount";
import { PageHeader } from "@/components/shared/PageHeader";
import { QueryError } from "@/components/shared/QueryError";
import { StatCard, MiniStat } from "@/components/dashboard/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Stagger, Item } from "@/components/shared/Motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo, formatDate } from "@/lib/format";

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading, isError, refetch } = useQuery({
    queryKey: ["stats"],
    queryFn: dashboardApi.stats,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });
  const { data: activity } = useQuery({ queryKey: ["activity"], queryFn: dashboardApi.activity, refetchInterval: 15_000 });
  const pendingCount = usePendingRequestCount();

  if (isLoading) return <DashboardSkeleton />;
  if (isError || !stats) {
    return (
      <QueryError message="Could not load dashboard stats." onRetry={() => refetch()} />
    );
  }

  const chartData = [
    { name: "Mobile", value: stats.applications, fill: "hsl(var(--chart-1))" },
    { name: "Web", value: stats.websites, fill: "hsl(var(--chart-3))" },
    { name: "Graphic", value: stats.graphic, fill: "hsl(var(--chart-4))" },
    { name: "Motion", value: stats.motion, fill: "hsl(var(--chart-5))" },
    { name: "Marketing", value: stats.marketing, fill: "hsl(var(--chart-2))" },
    { name: "Cyber", value: stats.cyber, fill: "hsl(var(--primary))" },
  ];

  const minis = [
    { label: "Mobile Apps", value: stats.applications, icon: Smartphone },
    { label: "Websites", value: stats.websites, icon: Globe },
    { label: "Graphic Design", value: stats.graphic, icon: Palette },
    { label: "Motion Graphics", value: stats.motion, icon: Film },
    { label: "Digital Marketing", value: stats.marketing, icon: Megaphone },
    { label: "Cybersecurity", value: stats.cyber, icon: Shield },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        subtitle="A snapshot of your BBD PROFOLIO ecosystem — graduates, projects and pending activity."
        actions={
          <>
            <Button variant="outline" onClick={() => navigate("/requests")} data-testid="dash-review-requests">
              <Inbox className="h-4 w-4" /> Review Requests
            </Button>
            <Button onClick={() => navigate("/projects")} data-testid="dash-new-project">
              <Plus className="h-4 w-4" /> New Project
            </Button>
          </>
        }
      />

      {/* Primary stats */}
      <Stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Graduates" value={stats.totalGraduates} icon={Users} hint="Approved & visible" onClick={() => navigate("/graduates")} />
        <StatCard label="Pending Requests" value={pendingCount} icon={Clock} accent hint="Awaiting your review" onClick={() => navigate("/requests")} />
        <StatCard label="Total Projects" value={stats.totalProjects} icon={FolderKanban} hint="Across all categories" onClick={() => navigate("/projects")} />
        <StatCard label="Categories" value={stats.categories} icon={Tags} hint="Active project types" onClick={() => navigate("/categories")} />
      </Stagger>

      {/* Category minis */}
      <Stagger className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {minis.map((m) => <MiniStat key={m.label} {...m} />)}
      </Stagger>

      {/* Chart + activity */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-soft lg:col-span-2"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-heading text-lg font-semibold">Projects by category</h3>
              <p className="text-sm text-muted-foreground">Distribution of published & draft work</p>
            </div>
            <Sparkles className="h-5 w-5 text-accent" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  cursor={{ fill: "hsl(var(--secondary))" }}
                  contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 13 }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={54}>
                  {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-soft"
        >
          <div className="mb-5 flex items-center gap-2">
            <ActivityIcon className="h-4 w-4 text-accent" />
            <h3 className="font-heading text-lg font-semibold">Latest activity</h3>
          </div>
          <div className="relative space-y-5 before:absolute before:left-[7px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-border">
            {(activity || []).slice(0, 6).map((a) => (
              <div key={a.id} className="relative flex gap-4 pl-6">
                <span className="absolute left-0 top-1 h-3.5 w-3.5 rounded-full border-2 border-accent bg-card" />
                <div>
                  <p className="text-sm leading-snug text-foreground">{a.message}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{timeAgo(a.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent requests + projects */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-heading text-lg font-semibold">Recent requests</h3>
            <button onClick={() => navigate("/requests")} className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {stats.recentRequests.map((r: any) => (
              <div key={r.id} className="flex items-center gap-3 rounded-xl border border-border/60 p-3 transition-colors hover:bg-secondary/40">
                <img src={r.photo} alt={r.fullName} className="h-10 w-10 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{r.fullName}</p>
                  <p className="truncate text-xs text-muted-foreground">{r.specialization}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-heading text-lg font-semibold">Recent projects</h3>
            <button onClick={() => navigate("/projects")} className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {stats.recentProjects.map((p: any) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border/60 p-3 transition-colors hover:bg-secondary/40">
                <img src={p.cover} alt={p.title} className="h-10 w-14 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{p.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.type} · {formatDate(p.completionDate)}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div>
      <Skeleton className="h-10 w-64" />
      <Skeleton className="mt-3 h-4 w-96" />
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}
