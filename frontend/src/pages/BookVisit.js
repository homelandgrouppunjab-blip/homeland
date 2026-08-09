import React, { useState, useEffect } from "react";
import { CalendarClock, Clock, Users, CheckCircle2, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { getProjects, createSiteVisit } from "@/lib/api";
import SectionHeading from "@/components/SectionHeading";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SLOTS = ["10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"];
const inputCls = "w-full rounded-xl bg-[color:var(--lux-charcoal)] border border-[color:var(--border-hairline)] px-4 py-3 text-sm text-ivory placeholder:text-[color:var(--lux-ivory)]/40 focus:outline-none focus:ring-2 focus:ring-[rgba(212,175,55,0.35)]";

export default function BookVisit() {
  const [projects, setProjects] = useState([]);
  const [date, setDate] = useState(null);
  const [slot, setSlot] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", project: "Any", guests: "1", notes: "", website: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => { getProjects().then(setProjects).catch(() => {}); }, []);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) { toast.error("Please fill your name, email and phone."); return; }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) { toast.error("Please enter a valid email."); return; }
    if (!date) { toast.error("Please pick a preferred date."); return; }
    if (!slot) { toast.error("Please pick a time slot."); return; }
    setLoading(true);
    try {
      await createSiteVisit({ ...form, visit_date: date.toISOString().slice(0, 10), time_slot: slot });
      setDone(true);
      toast.success("Your site visit is booked! Our team will confirm shortly.");
    } catch (err) { toast.error("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };

  if (done) {
    return (
      <div className="pt-20 pb-28 container-lux">
        <div className="max-w-lg mx-auto rounded-2xl bg-glass hairline p-10 text-center" data-testid="visit-success">
          <CheckCircle2 className="h-16 w-16 text-gold mx-auto" />
          <h2 className="font-display text-3xl text-ivory mt-4">Visit Requested</h2>
          <p className="mt-3 text-sm text-[color:var(--lux-ivory)]/70">
            Thank you, {form.name.split(" ")[0]}. We've received your request for <span className="text-gold">{date?.toDateString()}</span> at <span className="text-gold">{slot}</span>. A relationship manager will call you to confirm.
          </p>
          <button onClick={() => { setDone(false); setDate(null); setSlot(""); }} className="mt-6 text-sm text-gold hover:underline">Book another visit</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-14 pb-28">
      <div className="container-lux">
        <SectionHeading align="center" kicker="Private Appointment" title="Book a Site Visit" subtitle="Choose a date and time that suits you. Our team will host a guided tour of your chosen address." />

        <form onSubmit={submit} className="mt-12 grid lg:grid-cols-2 gap-8">
          <input type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set("website", e.target.value)} className="hidden" aria-hidden="true" />
          <div className="rounded-2xl bg-glass hairline p-6">
            <div className="flex items-center gap-2 text-gold text-sm font-semibold mb-4"><CalendarClock className="h-4 w-4" /> Select a Date</div>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                data-testid="visit-calendar"
                className="rounded-xl text-ivory"
              />
            </div>
            <div className="mt-6">
              <div className="flex items-center gap-2 text-gold text-sm font-semibold mb-3"><Clock className="h-4 w-4" /> Select a Time Slot</div>
              <div className="grid grid-cols-4 gap-2">
                {SLOTS.map((s) => (
                  <button type="button" key={s} onClick={() => setSlot(s)} data-testid={`visit-slot-${s.replace(/[:\s]/g, "")}`}
                    className={`rounded-lg border px-2 py-2 text-xs transition-colors ${slot === s ? "border-[color:var(--border-gold)] bg-[rgba(212,175,55,0.12)] text-gold" : "border-[color:var(--border-hairline)] text-[color:var(--lux-ivory)]/70 hover:text-ivory"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-glass hairline p-6 space-y-4">
            <div className="flex items-center gap-2 text-gold text-sm font-semibold"><Users className="h-4 w-4" /> Your Details</div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="text-xs text-platinum mb-1.5 block">Full Name *</label><input data-testid="visit-name-input" className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Your name" /></div>
              <div><label className="text-xs text-platinum mb-1.5 block">Phone *</label><input data-testid="visit-phone-input" className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 …" /></div>
            </div>
            <div><label className="text-xs text-platinum mb-1.5 block">Email *</label><input data-testid="visit-email-input" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@email.com" /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-platinum mb-1.5 block">Project</label>
                <Select value={form.project} onValueChange={(v) => set("project", v)}>
                  <SelectTrigger data-testid="visit-project-select" className={inputCls}><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[color:var(--lux-charcoal)] border-[color:var(--border-hairline)] text-ivory">
                    <SelectItem value="Any">Any Project</SelectItem>
                    {projects.map((p) => <SelectItem key={p.slug} value={p.name}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-platinum mb-1.5 block">Guests</label>
                <Select value={form.guests} onValueChange={(v) => set("guests", v)}>
                  <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[color:var(--lux-charcoal)] border-[color:var(--border-hairline)] text-ivory">
                    {["1", "2", "3", "4", "5+"].map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><label className="text-xs text-platinum mb-1.5 block">Notes (optional)</label><textarea rows={3} className={inputCls} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Anything we should know?" /></div>

            <div className="rounded-xl border gold-line bg-[rgba(212,175,55,0.05)] p-3 text-sm text-[color:var(--lux-ivory)]/80 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gold shrink-0" />
              {date && slot ? <span>Visit on <b className="text-gold">{date.toDateString()}</b> at <b className="text-gold">{slot}</b></span> : <span>Select a date and time slot to continue</span>}
            </div>

            <button type="submit" disabled={loading} data-testid="visit-submit-button" className="w-full inline-flex items-center justify-center gap-2 rounded-xl border gold-line bg-[rgba(212,175,55,0.08)] px-6 py-3.5 text-sm font-semibold text-gold hover:bg-[rgba(212,175,55,0.16)] disabled:opacity-60 transition-colors">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Booking…</> : "Confirm Site Visit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
