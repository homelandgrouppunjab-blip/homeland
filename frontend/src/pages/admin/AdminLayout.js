import React from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { LayoutDashboard, Building2, Inbox, FileText, Users, LogOut, ExternalLink, CalendarClock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/projects", label: "Projects", icon: Building2 },
  { to: "/admin/leads", label: "Leads", icon: Inbox },
  { to: "/admin/visits", label: "Visits", icon: CalendarClock },
  { to: "/admin/content", label: "Content", icon: FileText },
  { to: "/admin/team", label: "Team", icon: Users },
];

export default function AdminLayout() {
  const { logout, email } = useAuth();
  const nav = useNavigate();
  const doLogout = () => { logout(); nav("/admin/login"); };

  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-[color:var(--border-hairline)] bg-[color:var(--lux-obsidian)] p-5">
        <Link to="/admin" className="mb-8">
          <div className="font-display text-2xl text-ivory">HOMELAND</div>
          <div className="text-[10px] tracking-[0.4em] text-gold uppercase mt-1">Admin</div>
        </Link>
        <nav className="flex-1 space-y-1">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} data-testid={`admin-nav-${n.label.toLowerCase()}`}
              className={({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${isActive ? "bg-[rgba(212,175,55,0.10)] text-gold" : "text-[color:var(--lux-ivory)]/70 hover:bg-white/5 hover:text-ivory"}`}>
              <n.icon className="h-4 w-4" /> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="pt-4 border-t border-[color:var(--border-hairline)] space-y-2">
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-[color:var(--lux-ivory)]/70 hover:text-gold"><ExternalLink className="h-4 w-4" /> View Site</a>
          <button onClick={doLogout} data-testid="admin-logout" className="w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-[color:var(--lux-ivory)]/70 hover:text-destructive"><LogOut className="h-4 w-4" /> Logout</button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-[color:var(--border-hairline)] bg-[color:var(--surface-glass-strong)] backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="lg:hidden font-display text-lg text-ivory">HOMELAND Admin</div>
          <div className="flex items-center gap-4 ml-auto">
            <span className="text-xs text-[color:var(--lux-ivory)]/60">{email}</span>
            <button onClick={doLogout} className="lg:hidden text-[color:var(--lux-ivory)]/70"><LogOut className="h-4 w-4" /></button>
          </div>
        </header>
        <div className="lg:hidden flex gap-1 overflow-x-auto no-scrollbar border-b border-[color:var(--border-hairline)] px-3 py-2">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `shrink-0 rounded-lg px-3 py-2 text-xs ${isActive ? "bg-[rgba(212,175,55,0.10)] text-gold" : "text-[color:var(--lux-ivory)]/70"}`}>{n.label}</NavLink>
          ))}
        </div>
        <main className="flex-1 p-6"><Outlet /></main>
      </div>
    </div>
  );
}
