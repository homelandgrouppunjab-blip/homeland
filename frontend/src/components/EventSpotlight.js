import React, { useState } from "react";
import { CalendarDays, MapPin, Loader2, CheckCircle2, Ticket } from "lucide-react";
import { toast } from "sonner";
import { createLead } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const cls = "w-full rounded-lg bg-[color:var(--lux-charcoal)] border border-[color:var(--border-hairline)] px-3 py-2.5 text-sm text-ivory placeholder:text-[color:var(--lux-ivory)]/40 focus:outline-none focus:ring-2 focus:ring-[rgba(212,175,55,0.35)]";
const lbl = "text-xs text-platinum mb-1 block";

// Featured event banner (uses the first/pinned event) with a working RSVP form
// that records the interest as a lead in Admin → Leads.
export default function EventSpotlight({ events = [] }) {
  const ev = events[0];
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  if (!ev) return null;

  const submit = async () => {
    if (!form.name || !form.phone) { toast.error("Please add your name and phone"); return; }
    setSaving(true);
    try {
      await createLead({
        name: form.name, phone: form.phone, email: form.email,
        project: ev.title, requirement: "Event RSVP",
        message: `RSVP for event "${ev.title}"${ev.date ? ` on ${ev.date}` : ""}${ev.venue ? ` at ${ev.venue}` : ""}`,
      });
      setDone(true);
      toast.success("RSVP received — we'll be in touch!");
    } catch { toast.error("Could not submit, please try again"); } finally { setSaving(false); }
  };

  const openForm = () => { setDone(false); setForm({ name: "", phone: "", email: "" }); setOpen(true); };

  return (
    <div className="mt-8 overflow-hidden rounded-3xl border border-[color:var(--border-gold)] bg-glass" data-testid="event-spotlight">
      <div className="grid md:grid-cols-[1.1fr_1fr]">
        <div className="relative min-h-[220px] bg-[color:var(--lux-graphite)]">
          {ev.image && <img src={ev.image} alt={ev.title} className="absolute inset-0 h-full w-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent md:bg-gradient-to-r" />
          <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-[rgba(212,175,55,0.92)] text-[#1b1710] text-[11px] font-semibold uppercase tracking-wider px-3 py-1"><Ticket className="h-3.5 w-3.5" /> Upcoming Event</span>
        </div>
        <div className="p-7 lg:p-9 flex flex-col justify-center">
          <h2 className="font-display text-2xl lg:text-3xl text-ivory leading-snug">{ev.title}</h2>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-[color:var(--lux-ivory)]/75">
            {ev.date && <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-gold" /> {ev.date}</span>}
            {ev.venue && <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" /> {ev.venue}</span>}
          </div>
          {ev.excerpt && <p className="mt-4 text-sm text-[color:var(--lux-ivory)]/65 leading-relaxed line-clamp-3">{ev.excerpt}</p>}
          <div className="mt-6">
            <button onClick={openForm} data-testid="event-rsvp-button" className="inline-flex items-center gap-2 rounded-xl border gold-line bg-[rgba(212,175,55,0.1)] px-6 py-3 text-sm font-semibold text-gold hover:bg-[rgba(212,175,55,0.18)] transition-colors">
              RSVP for this Event
            </button>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-[color:var(--lux-charcoal)] border-[color:var(--border-hairline)] text-ivory">
          <DialogHeader><DialogTitle className="font-display text-2xl">{done ? "You're on the list" : `RSVP — ${ev.title}`}</DialogTitle></DialogHeader>
          {done ? (
            <div className="py-6 text-center space-y-3" data-testid="event-rsvp-success">
              <CheckCircle2 className="h-12 w-12 text-gold mx-auto" />
              <p className="text-sm text-[color:var(--lux-ivory)]/75">Thank you{form.name ? `, ${form.name}` : ""}! Our team will reach out with the event details.</p>
              <button onClick={() => setOpen(false)} className="mt-2 rounded-xl bg-white/5 px-5 py-2.5 text-sm text-ivory">Close</button>
            </div>
          ) : (
            <div className="space-y-4 mt-1">
              <div><label className={lbl}>Full Name *</label><input className={cls} value={form.name} onChange={(e) => set("name", e.target.value)} data-testid="event-rsvp-name" /></div>
              <div><label className={lbl}>Phone *</label><input className={cls} value={form.phone} onChange={(e) => set("phone", e.target.value)} data-testid="event-rsvp-phone" /></div>
              <div><label className={lbl}>Email (optional)</label><input className={cls} value={form.email} onChange={(e) => set("email", e.target.value)} data-testid="event-rsvp-email" /></div>
              <button onClick={submit} disabled={saving} data-testid="event-rsvp-submit" className="w-full inline-flex items-center justify-center gap-2 rounded-xl border gold-line bg-[rgba(212,175,55,0.1)] px-5 py-3 text-sm font-semibold text-gold hover:bg-[rgba(212,175,55,0.18)] disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Confirm RSVP</button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
