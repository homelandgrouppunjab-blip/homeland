import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Inbox, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { adminStats, adminGetLeads } from "@/lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  useEffect(() => {
    adminStats().then(setStats).catch(() => {});
    adminGetLeads().then((d) => setLeads(d.slice(0, 5))).catch(() => {});
  }, []);

  const cards = [
    { label: "Total Projects", value: stats?.total_projects, icon: Building2 },
    { label: "Delivered", value: stats?.delivered, icon: CheckCircle2 },
    { label: "Ongoing", value: stats?.ongoing, icon: Clock },
    { label: "Total Leads", value: stats?.total_leads, icon: Inbox },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl text-ivory">Dashboard</h1>
      <p className="text-sm text-[color:var(--lux-ivory)]/60 mt-1">Overview of your projects and enquiries.</p>

      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div key={i} className="rounded-2xl bg-glass hairline p-6">
            <c.icon className="h-5 w-5 text-gold" />
            <div className="mt-4 font-display text-4xl text-ivory tabular-nums">{c.value ?? "—"}</div>
            <div className="text-xs text-[color:var(--lux-ivory)]/60 mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-glass hairline p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl text-ivory">Recent Enquiries</h2>
          <Link to="/admin/leads" className="inline-flex items-center gap-2 text-sm text-gold">View all <ArrowRight className="h-4 w-4" /></Link>
        </div>
        {leads.length === 0 ? (
          <div className="text-sm text-[color:var(--lux-ivory)]/50 py-8 text-center">No enquiries yet.</div>
        ) : (
          <div className="space-y-2">
            {leads.map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded-xl bg-[color:var(--lux-charcoal)] px-4 py-3">
                <div><div className="text-sm text-ivory font-medium">{l.name}</div><div className="text-xs text-[color:var(--lux-ivory)]/55">{l.project} · {l.phone}</div></div>
                <span className="text-xs rounded-full bg-[rgba(212,175,55,0.10)] text-gold px-3 py-1">{l.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
