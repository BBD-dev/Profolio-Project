import { useLocation, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, Bell, Search } from "lucide-react";
import {
  LayoutDashboard, Inbox, GraduationCap, FolderKanban,
  Tags, LayoutTemplate, Images, Settings as SettingsIcon, LogOut,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BrandMark } from "@/components/layout/BrandMark";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/services/api";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { usePendingRequestCount } from "@/hooks/usePendingRequestCount";
import { CountBadge } from "@/components/shared/CountBadge";
import { ProfileAvatar } from "@/components/shared/ProfileAvatar";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/requests": "Graduate Requests",
  "/graduates": "Graduates",
  "/projects": "Projects",
  "/categories": "Categories",
  "/homepage": "Homepage",
  "/media": "Media Library",
  "/settings": "Settings",
};

const mobileNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/requests", label: "Graduate Requests", icon: Inbox, badge: "pending" as const },
  { to: "/graduates", label: "Graduates", icon: GraduationCap },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/homepage", label: "Homepage", icon: LayoutTemplate },
  { to: "/media", label: "Media Library", icon: Images },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [openMobile, setOpenMobile] = useState(false);
  const { data: activity } = useQuery({ queryKey: ["activity"], queryFn: dashboardApi.activity, refetchInterval: 15_000 });
  const pendingCount = usePendingRequestCount();
  const title = titles[location.pathname] || "BBD PROFOLIO";

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl md:px-8" data-testid="topbar">
      {/* Mobile menu */}
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetTrigger asChild>
          <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-border lg:hidden" data-testid="mobile-menu-trigger">
            <Menu className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0">
          <div className="flex h-[72px] items-center px-6"><BrandMark /></div>
          <nav className="space-y-1 px-4">
            {mobileNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpenMobile(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                )}
              >
                <item.icon className="h-[18px] w-[18px]" />
                <span className="flex-1">{item.label}</span>
                {item.badge === "pending" ? <CountBadge count={pendingCount} /> : null}
              </NavLink>
            ))}
            <button onClick={handleLogout} className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10">
              <LogOut className="h-[18px] w-[18px]" /> Logout
            </button>
          </nav>
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 items-center gap-3 lg:hidden">
        <BrandLogo size={32} />
        <h2 className="truncate font-heading text-base font-semibold text-foreground">{title}</h2>
      </div>

      <div className="hidden lg:block">
        <h2 className="font-heading text-lg font-semibold text-foreground">{title}</h2>
      </div>

      <div className="ml-auto flex items-center gap-2 md:gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            data-testid="global-search"
            placeholder="Search…"
            className="h-10 w-52 rounded-xl border border-border bg-secondary/50 pl-9 pr-3 text-sm outline-none transition-all focus:w-64 focus:outline-none focus:ring-0 focus:bg-card"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border transition-colors hover:bg-secondary" data-testid="notifications-trigger">
              <Bell className="h-[18px] w-[18px]" />
              {pendingCount > 0 ? (
                <span className="absolute -right-1 -top-1">
                  <CountBadge count={pendingCount} />
                </span>
              ) : null}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="border-b border-border px-4 py-3">
              <p className="text-sm font-semibold">Notifications</p>
            </div>
            {pendingCount > 0 ? (
              <button
                type="button"
                onClick={() => navigate("/requests")}
                className="flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-secondary/50"
              >
                <Inbox className="h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {pendingCount} graduate {pendingCount === 1 ? "request" : "requests"} waiting
                  </p>
                  <p className="text-xs text-muted-foreground">Open Graduate Requests to review</p>
                </div>
                <CountBadge count={pendingCount} />
              </button>
            ) : null}
            <div className="max-h-80 overflow-y-auto">
              {(activity || []).length === 0 && pendingCount === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications yet.</p>
              ) : (
                (activity || []).slice(0, 6).map((a) => (
                  <div key={a.id} className="flex gap-3 border-b border-border px-4 py-3 last:border-0">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                    <div className="min-w-0">
                      <p className="text-sm leading-snug text-foreground">{a.message}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{timeAgo(a.timestamp)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        <ProfileAvatar src={user?.avatar} name={user?.name || "Admin"} size={40} testID="topbar-avatar" />
      </div>
    </header>
  );
}
