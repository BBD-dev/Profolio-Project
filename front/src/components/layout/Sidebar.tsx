import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Inbox, GraduationCap, FolderKanban,
  Tags, LayoutTemplate, Images, Settings as SettingsIcon, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/layout/BrandMark";
import { useAuth } from "@/context/AuthContext";
import { usePendingRequestCount } from "@/hooks/usePendingRequestCount";
import { CountBadge } from "@/components/shared/CountBadge";
import { ProfileAvatar } from "@/components/shared/ProfileAvatar";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/requests", label: "Graduate Requests", icon: Inbox, badgeKey: "pendingRequests" },
  { to: "/graduates", label: "Graduates", icon: GraduationCap },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/homepage", label: "Homepage", icon: LayoutTemplate },
  { to: "/media", label: "Media Library", icon: Images },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const pendingCount = usePendingRequestCount();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col border-r border-border bg-card lg:flex" data-testid="sidebar">
      <div className="flex h-[72px] items-center px-6">
        <BrandMark />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4 no-scrollbar">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Manage</p>
        {nav.map((item) => {
          const badge = item.badgeKey === "pendingRequests" ? pendingCount : 0;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              className={({ isActive }) =>
                cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-xl bg-primary shadow-lift"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <item.icon className="relative z-10 h-[18px] w-[18px] shrink-0" strokeWidth={2} />
                  <span className="relative z-10 flex-1">{item.label}</span>
                  <CountBadge count={badge} />
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-border px-3 py-2.5">
          <ProfileAvatar src={user?.avatar} name={user?.name || "Admin"} size={36} />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-semibold text-foreground">{user?.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          data-testid="sidebar-logout"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-[18px] w-[18px]" strokeWidth={2} />
          Logout
        </button>
      </div>
    </aside>
  );
}
