import React, { useState } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import { createLead } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const inputCls =
  "w-full rounded-xl bg-[color:var(--lux-charcoal)] border border-[color:var(--border-hairline)] px-4 py-3 text-sm text-ivory placeholder:text-[color:var(--lux-ivory)]/40 focus:outline-none focus:ring-2 focus:ring-[rgba(212,175,55,0.35)] focus:border-[color:var(--border-gold)] transition-colors";

export const EnquiryForm = ({ projects = [], defaultProject = "Any", compact = false }) => {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", project: defaultProject,
    requirement: "Residential", budget: "", message: "", preferred_contact_time: "", website: "",
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) {
      toast.error("Please fill in your name, email and phone.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!/^[0-9+\-\s]{7,15}$/.test(form.phone)) {
      toast.error("Please enter a valid phone number.");
      return;
    }
    setLoading(true);
    try {
      await createLead(form);
      setDone(true);
      toast.success("Thank you! Our team will reach out to you shortly.");
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div data-testid="enquiry-success" className="rounded-2xl bg-glass hairline p-10 text-center">
        <CheckCircle2 className="h-14 w-14 text-gold mx-auto" />
        <h3 className="font-display text-2xl text-ivory mt-4">Enquiry Received</h3>
        <p className="mt-2 text-sm text-[color:var(--lux-ivory)]/70">
          Thank you, {form.name.split(" ")[0]}. A Homeland relationship manager will contact you soon.
        </p>
        <button onClick={() => { setDone(false); setForm({ ...form, message: "" }); }} className="mt-6 text-sm text-gold hover:underline">
          Submit another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} data-testid="enquiry-form" className={`grid ${compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"} gap-4`}>
      <input type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set("website", e.target.value)} className="hidden" aria-hidden="true" />
      <div>
        <label className="text-xs text-platinum mb-1.5 block">Full Name *</label>
        <input data-testid="enquiry-name-input" className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Your name" />
      </div>
      <div>
        <label className="text-xs text-platinum mb-1.5 block">Phone *</label>
        <input data-testid="enquiry-phone-input" className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 …" />
      </div>
      <div>
        <label className="text-xs text-platinum mb-1.5 block">Email *</label>
        <input data-testid="enquiry-email-input" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@email.com" />
      </div>
      <div>
        <label className="text-xs text-platinum mb-1.5 block">Project of Interest</label>
        <Select value={form.project} onValueChange={(v) => set("project", v)}>
          <SelectTrigger data-testid="enquiry-project-select" className={inputCls}><SelectValue /></SelectTrigger>
          <SelectContent className="bg-[color:var(--lux-charcoal)] border-[color:var(--border-hairline)] text-ivory">
            <SelectItem value="Any">Any Project</SelectItem>
            {projects.map((p) => <SelectItem key={p.slug || p.name} value={p.name}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-xs text-platinum mb-1.5 block">Requirement</label>
        <Select value={form.requirement} onValueChange={(v) => set("requirement", v)}>
          <SelectTrigger data-testid="enquiry-requirement-select" className={inputCls}><SelectValue /></SelectTrigger>
          <SelectContent className="bg-[color:var(--lux-charcoal)] border-[color:var(--border-hairline)] text-ivory">
            <SelectItem value="Residential">Residential</SelectItem>
            <SelectItem value="Commercial">Commercial</SelectItem>
            <SelectItem value="Investment">Investment</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-xs text-platinum mb-1.5 block">Budget (optional)</label>
        <input data-testid="enquiry-budget-input" className={inputCls} value={form.budget} onChange={(e) => set("budget", e.target.value)} placeholder="e.g. ₹1.5 - 2 Cr" />
      </div>
      <div className={compact ? "" : "sm:col-span-2"}>
        <label className="text-xs text-platinum mb-1.5 block">Preferred Contact Time</label>
        <input data-testid="enquiry-time-input" className={inputCls} value={form.preferred_contact_time} onChange={(e) => set("preferred_contact_time", e.target.value)} placeholder="e.g. Weekdays, 10am - 1pm" />
      </div>
      <div className={compact ? "" : "sm:col-span-2"}>
        <label className="text-xs text-platinum mb-1.5 block">Message</label>
        <textarea data-testid="enquiry-message-input" rows={compact ? 3 : 4} className={inputCls} value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="Tell us what you're looking for…" />
      </div>
      <div className={compact ? "" : "sm:col-span-2"}>
        <button
          type="submit"
          disabled={loading}
          data-testid="enquiry-submit-button"
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gold-btn border gold-line px-6 py-3.5 text-sm font-semibold tracking-wide text-gold hover:bg-[rgba(212,175,55,0.12)] disabled:opacity-60 transition-colors"
          style={{ background: "rgba(212,175,55,0.06)" }}
        >
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : "Submit Enquiry"}
        </button>
      </div>
    </form>
  );
};

export default EnquiryForm;
