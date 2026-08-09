import React, { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { getContent, adminUpdateContent } from "@/lib/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import FileUpload from "@/components/FileUpload";

const cls = "w-full rounded-lg bg-[color:var(--lux-charcoal)] border border-[color:var(--border-hairline)] px-3 py-2.5 text-sm text-ivory placeholder:text-[color:var(--lux-ivory)]/40 focus:outline-none focus:ring-2 focus:ring-[rgba(212,175,55,0.35)]";
const lbl = "text-xs text-platinum mb-1 block";

export default function AdminContent() {
  const [c, setC] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { getContent().then(setC).catch(() => {}); }, []);
  if (!c) return <div className="text-[color:var(--lux-ivory)]/50">Loading…</div>;

  const set = (k, v) => setC((p) => ({ ...p, [k]: v }));
  const setArr = (key, idx, field, v) => setC((p) => { const a = [...(p[key] || [])]; a[idx] = { ...a[idx], [field]: v }; return { ...p, [key]: a }; });
  const addRow = (key, tpl) => setC((p) => ({ ...p, [key]: [...(p[key] || []), tpl] }));
  const delRow = (key, idx) => setC((p) => ({ ...p, [key]: p[key].filter((_, i) => i !== idx) }));
  // string-array helpers (e.g. history paragraphs)
  const setStr = (key, idx, v) => setC((p) => { const a = [...(p[key] || [])]; a[idx] = v; return { ...p, [key]: a }; });
  const addStr = (key) => setC((p) => ({ ...p, [key]: [...(p[key] || []), ""] }));
  const delStr = (key, idx) => setC((p) => ({ ...p, [key]: p[key].filter((_, i) => i !== idx) }));
  // nested object helpers (e.g. social links)
  const setObj = (key, field, v) => setC((p) => ({ ...p, [key]: { ...(p[key] || {}), [field]: v } }));

  const save = async () => {
    setSaving(true);
    try { const updated = await adminUpdateContent({ ...c, founding_year: parseInt(c.founding_year) || c.founding_year }); setC(updated); toast.success("Content saved"); }
    catch { toast.error("Save failed"); } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-3xl text-ivory">Site Content</h1><p className="text-sm text-[color:var(--lux-ivory)]/60 mt-1">Edit company info, vision, benchmarks and contact details.</p></div>
        <button onClick={save} disabled={saving} data-testid="admin-content-save" className="inline-flex items-center gap-2 rounded-xl border gold-line bg-[rgba(212,175,55,0.08)] px-4 py-2.5 text-sm font-semibold text-gold hover:bg-[rgba(212,175,55,0.16)] disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes</button>
      </div>

      <Tabs defaultValue="general" className="mt-8">
        <TabsList className="bg-[color:var(--lux-charcoal)] border border-[color:var(--border-hairline)] flex-wrap h-auto">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="vision">Vision</TabsTrigger>
          <TabsTrigger value="awards">Awards</TabsTrigger>
          <TabsTrigger value="contact">Contact & Social</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6 space-y-4 max-w-2xl">
          <div><label className={lbl}>Brand Name</label><input className={cls} value={c.brand_name || ""} onChange={(e) => set("brand_name", e.target.value)} /></div>
          <div><label className={lbl}>Brand Tagline</label><input className={cls} value={c.brand_tagline || ""} onChange={(e) => set("brand_tagline", e.target.value)} /></div>
          <div><label className={lbl}>Founding Year</label><input className={cls} value={c.founding_year || ""} onChange={(e) => set("founding_year", e.target.value)} /></div>
          <div><FileUpload label="Site Logo (header & footer)" value={c.site_logo || ""} onChange={(v) => set("site_logo", v)} testid="admin-content-logo" /><p className="text-xs text-[color:var(--lux-ivory)]/40 mt-1">Leave empty to use the default Homeland logo.</p></div>
          <div><label className={lbl}>Short Intro (one-liner)</label><textarea rows={3} className={cls} value={c.history_intro || ""} onChange={(e) => set("history_intro", e.target.value)} /></div>
        </TabsContent>

        <TabsContent value="history" className="mt-6 space-y-3 max-w-3xl">
          <p className="text-xs text-[color:var(--lux-ivory)]/50">Full company story paragraphs shown on the Home &amp; About pages.</p>
          {(c.history_full || []).map((para, i) => (
            <div key={i} className="rounded-xl bg-glass hairline p-4 flex gap-3 items-start">
              <textarea rows={4} className={cls} placeholder={`Paragraph ${i + 1}`} value={para} onChange={(e) => setStr("history_full", i, e.target.value)} data-testid={`admin-content-history-${i}`} />
              <button onClick={() => delStr("history_full", i)} className="h-9 w-9 shrink-0 grid place-items-center rounded-lg bg-white/5 text-ivory hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          <button onClick={() => addStr("history_full")} data-testid="admin-content-history-add" className="inline-flex items-center gap-2 text-sm text-gold"><Plus className="h-4 w-4" /> Add Paragraph</button>
        </TabsContent>

        <TabsContent value="milestones" className="mt-6 space-y-3">
          {(c.milestones || []).map((m, i) => (
            <div key={i} className="rounded-xl bg-glass hairline p-4 grid sm:grid-cols-[100px_1fr_2fr_auto] gap-3 items-start">
              <input className={cls} placeholder="Year" value={m.year} onChange={(e) => setArr("milestones", i, "year", e.target.value)} />
              <input className={cls} placeholder="Title" value={m.title} onChange={(e) => setArr("milestones", i, "title", e.target.value)} />
              <input className={cls} placeholder="Description" value={m.description} onChange={(e) => setArr("milestones", i, "description", e.target.value)} />
              <button onClick={() => delRow("milestones", i)} className="h-9 w-9 grid place-items-center rounded-lg bg-white/5 text-ivory hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          <button onClick={() => addRow("milestones", { year: "", title: "", description: "" })} className="inline-flex items-center gap-2 text-sm text-gold"><Plus className="h-4 w-4" /> Add Milestone</button>
        </TabsContent>

        <TabsContent value="benchmarks" className="mt-6 space-y-3">
          {(c.benchmark_kpis || []).map((k, i) => (
            <div key={i} className="rounded-xl bg-glass hairline p-4 grid sm:grid-cols-[100px_1fr_2fr_120px_auto] gap-3 items-start">
              <input className={cls} placeholder="Value" value={k.value} onChange={(e) => setArr("benchmark_kpis", i, "value", e.target.value)} />
              <input className={cls} placeholder="Label" value={k.label} onChange={(e) => setArr("benchmark_kpis", i, "label", e.target.value)} />
              <input className={cls} placeholder="Description" value={k.description} onChange={(e) => setArr("benchmark_kpis", i, "description", e.target.value)} />
              <input className={cls} placeholder="icon" value={k.icon} onChange={(e) => setArr("benchmark_kpis", i, "icon", e.target.value)} />
              <button onClick={() => delRow("benchmark_kpis", i)} className="h-9 w-9 grid place-items-center rounded-lg bg-white/5 text-ivory hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          <p className="text-xs text-[color:var(--lux-ivory)]/40">Icons: award, users, building-2, clock, ruler, shield-check</p>
          <button onClick={() => addRow("benchmark_kpis", { value: "", label: "", description: "", icon: "award" })} className="inline-flex items-center gap-2 text-sm text-gold"><Plus className="h-4 w-4" /> Add KPI</button>
        </TabsContent>

        <TabsContent value="vision" className="mt-6 space-y-4">
          <div className="max-w-2xl"><label className={lbl}>Vision Statement</label><textarea rows={4} className={cls} value={c.vision_statement || ""} onChange={(e) => set("vision_statement", e.target.value)} /></div>
          <div className="space-y-3">
            {(c.vision_pillars || []).map((p, i) => (
              <div key={i} className="rounded-xl bg-glass hairline p-4 grid sm:grid-cols-[1fr_2fr_auto] gap-3 items-start">
                <input className={cls} placeholder="Title" value={p.title} onChange={(e) => setArr("vision_pillars", i, "title", e.target.value)} />
                <input className={cls} placeholder="Description" value={p.description} onChange={(e) => setArr("vision_pillars", i, "description", e.target.value)} />
                <button onClick={() => delRow("vision_pillars", i)} className="h-9 w-9 grid place-items-center rounded-lg bg-white/5 text-ivory hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
            <button onClick={() => addRow("vision_pillars", { title: "", description: "" })} className="inline-flex items-center gap-2 text-sm text-gold"><Plus className="h-4 w-4" /> Add Pillar</button>
          </div>
        </TabsContent>

        <TabsContent value="awards" className="mt-6 space-y-3 max-w-3xl">
          <p className="text-xs text-[color:var(--lux-ivory)]/50">Awards &amp; honours shown on the About page.</p>
          {(c.awards || []).map((a, i) => (
            <div key={i} className="rounded-xl bg-glass hairline p-4 grid sm:grid-cols-[2fr_120px_auto] gap-3 items-start">
              <input className={cls} placeholder="Award title" value={a.title || ""} onChange={(e) => setArr("awards", i, "title", e.target.value)} data-testid={`admin-content-award-${i}`} />
              <input className={cls} placeholder="Year" value={a.year || ""} onChange={(e) => setArr("awards", i, "year", e.target.value)} />
              <button onClick={() => delRow("awards", i)} className="h-9 w-9 grid place-items-center rounded-lg bg-white/5 text-ivory hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          <button onClick={() => addRow("awards", { title: "", year: "" })} data-testid="admin-content-award-add" className="inline-flex items-center gap-2 text-sm text-gold"><Plus className="h-4 w-4" /> Add Award</button>
        </TabsContent>

        <TabsContent value="contact" className="mt-6 space-y-4 max-w-2xl">
          <div><label className={lbl}>Phone</label><input className={cls} value={c.contact_phone || ""} onChange={(e) => set("contact_phone", e.target.value)} /></div>
          <div><label className={lbl}>Email</label><input className={cls} value={c.contact_email || ""} onChange={(e) => set("contact_email", e.target.value)} /></div>
          <div><label className={lbl}>WhatsApp</label><input className={cls} value={c.contact_whatsapp || ""} onChange={(e) => set("contact_whatsapp", e.target.value)} /></div>
          <div><label className={lbl}>Address</label><input className={cls} value={c.contact_address || ""} onChange={(e) => set("contact_address", e.target.value)} /></div>
          <div className="pt-4 border-t border-[color:var(--border-hairline)]">
            <h3 className="text-sm font-semibold text-ivory mb-3">Social Media Links</h3>
            <div className="space-y-3">
              {["instagram", "facebook", "linkedin", "youtube"].map((k) => (
                <div key={k}>
                  <label className={lbl}>{k.charAt(0).toUpperCase() + k.slice(1)} URL</label>
                  <input className={cls} value={(c.social && c.social[k]) || ""} onChange={(e) => setObj("social", k, e.target.value)} placeholder={`https://…`} data-testid={`admin-content-social-${k}`} />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
