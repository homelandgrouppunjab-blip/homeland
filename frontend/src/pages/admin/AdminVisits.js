import React, { useEffect, useState } from "react";
import { Trash2, Mail, Phone, CalendarClock, Clock, Users } from "lucide-react";
import { toast } from "sonner";
import { adminGetVisits, adminUpdateVisit, adminDeleteVisit } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS = ["new", "confirmed", "completed", "cancelled"];
const COLOR = {
  new: "bg-[rgba(212,175,55,0.10)] text-gold",
  confirmed: "bg-[rgba(46,125,91,0.15)] text-[#7fd3ad]",
  completed: "bg-white/10 text-platinum",
  cancelled: "bg-[rgba(220,60,60,0.12)] text-[#e88]",
};

export default function AdminVisits() {
  const [visits, setVisits] = useState([]);
  const [filter, setFilter] = useState("all");

  const load = () => adminGetVisits().then(setVisits).catch(() => toast.error("Failed to load visits"));
  useEffect(() => { load(); }, []);

  const changeStatus = async (id, status) => {
    try { await adminUpdateVisit(id, status); toast.success("Updated"); load(); } catch { toast.error("Update failed"); }
  };
  const del = async (id) => { try { await adminDeleteVisit(id); toast.success("Deleted"); load(); } catch { toast.error("Delete failed"); } };

  const shown = filter === "all" ? visits : visits.filter((v) => v.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-3xl text-ivory">Site Visits</h1><p className="text-sm text-[color:var(--lux-ivory)]/60 mt-1">{visits.length} booking{visits.length !== 1 ? "s" : ""}</p></div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40 rounded-xl bg-[color:var(--lux-charcoal)] border-[color:var(--border-hairline)] text-ivory"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-[color:var(--lux-charcoal)] border-[color:var(--border-hairline)] text-ivory">
            <SelectItem value="all">All</SelectItem>{STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-8 space-y-3" data-testid="admin-visits-list">
        {shown.map((v) => (
          <div key={v.id} className="rounded-2xl bg-glass hairline p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-ivory font-semibold">{v.name}</span>
                  <span className={`text-xs rounded-full px-2.5 py-0.5 ${COLOR[v.status] || COLOR.new}`}>{v.status}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[color:var(--lux-ivory)]/70">
                  <span className="inline-flex items-center gap-1.5 text-gold"><CalendarClock className="h-3.5 w-3.5" /> {v.visit_date}</span>
                  <span className="inline-flex items-center gap-1.5 text-gold"><Clock className="h-3.5 w-3.5" /> {v.time_slot}</span>
                  <span className="inline-flex items-center gap-1.5"><Users className="h-3 w-3" /> {v.guests} guest(s)</span>
                  <span>Project: <span className="text-[color:var(--lux-ivory)]/85">{v.project}</span></span>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[color:var(--lux-ivory)]/60">
                  <a href={`mailto:${v.email}`} className="inline-flex items-center gap-1.5 hover:text-gold"><Mail className="h-3 w-3" /> {v.email}</a>
                  <a href={`tel:${v.phone}`} className="inline-flex items-center gap-1.5 hover:text-gold"><Phone className="h-3 w-3" /> {v.phone}</a>
                </div>
                {v.notes && <p className="mt-2 text-sm text-[color:var(--lux-ivory)]/70">{v.notes}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Select value={v.status} onValueChange={(val) => changeStatus(v.id, val)}>
                  <SelectTrigger className="w-36 rounded-lg bg-[color:var(--lux-charcoal)] border-[color:var(--border-hairline)] text-ivory text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[color:var(--lux-charcoal)] border-[color:var(--border-hairline)] text-ivory">{STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
                <button onClick={() => del(v.id)} className="h-9 w-9 grid place-items-center rounded-lg bg-white/5 text-ivory hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="text-[11px] text-[color:var(--lux-ivory)]/40 mt-3">Booked {new Date(v.created_at).toLocaleString()}</div>
          </div>
        ))}
        {shown.length === 0 && <div className="text-center py-20 text-[color:var(--lux-ivory)]/50">No site visits found.</div>}
      </div>
    </div>
  );
}
