import React, { useEffect, useState } from "react";
import { Trash2, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { adminGetLeads, adminUpdateLead, adminDeleteLead } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS = ["new", "contacted", "closed"];

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [filter, setFilter] = useState("all");

  const load = () => adminGetLeads().then(setLeads).catch(() => toast.error("Failed to load leads"));
  useEffect(() => { load(); }, []);

  const changeStatus = async (id, status) => {
    try { await adminUpdateLead(id, status); toast.success("Updated"); load(); } catch { toast.error("Update failed"); }
  };
  const del = async (id) => { try { await adminDeleteLead(id); toast.success("Deleted"); load(); } catch { toast.error("Delete failed"); } };

  const shown = filter === "all" ? leads : leads.filter((l) => l.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-3xl text-ivory">Leads Inbox</h1><p className="text-sm text-[color:var(--lux-ivory)]/60 mt-1">{leads.length} total enquiries</p></div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40 rounded-xl bg-[color:var(--lux-charcoal)] border-[color:var(--border-hairline)] text-ivory"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-[color:var(--lux-charcoal)] border-[color:var(--border-hairline)] text-ivory">
            <SelectItem value="all">All</SelectItem>{STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-8 space-y-3" data-testid="admin-leads-list">
        {shown.map((l) => (
          <div key={l.id} className="rounded-2xl bg-glass hairline p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-3"><span className="text-ivory font-semibold">{l.name}</span><span className="text-xs rounded-full bg-[rgba(212,175,55,0.10)] text-gold px-2.5 py-0.5">{l.requirement}</span></div>
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[color:var(--lux-ivory)]/60">
                  <a href={`mailto:${l.email}`} className="inline-flex items-center gap-1.5 hover:text-gold"><Mail className="h-3 w-3" /> {l.email}</a>
                  <a href={`tel:${l.phone}`} className="inline-flex items-center gap-1.5 hover:text-gold"><Phone className="h-3 w-3" /> {l.phone}</a>
                  <span>Project: <span className="text-[color:var(--lux-ivory)]/80">{l.project}</span></span>
                  {l.budget && <span>Budget: {l.budget}</span>}
                </div>
                {l.message && <p className="mt-2 text-sm text-[color:var(--lux-ivory)]/70">{l.message}</p>}
                {l.preferred_contact_time && <p className="mt-1 text-xs text-[color:var(--lux-ivory)]/50">Preferred: {l.preferred_contact_time}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Select value={l.status} onValueChange={(v) => changeStatus(l.id, v)}>
                  <SelectTrigger className="w-32 rounded-lg bg-[color:var(--lux-charcoal)] border-[color:var(--border-hairline)] text-ivory text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[color:var(--lux-charcoal)] border-[color:var(--border-hairline)] text-ivory">{STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
                <button onClick={() => del(l.id)} className="h-9 w-9 grid place-items-center rounded-lg bg-white/5 text-ivory hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="text-[11px] text-[color:var(--lux-ivory)]/40 mt-3">{new Date(l.created_at).toLocaleString()}</div>
          </div>
        ))}
        {shown.length === 0 && <div className="text-center py-20 text-[color:var(--lux-ivory)]/50">No leads found.</div>}
      </div>
    </div>
  );
}
