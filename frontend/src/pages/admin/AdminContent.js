import React, { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Save, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { getContent, adminUpdateContent, adminAiDesign } from "@/lib/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FileUpload from "@/components/FileUpload";

const cls = "w-full rounded-lg bg-[color:var(--lux-charcoal)] border border-[color:var(--border-hairline)] px-3 py-2.5 text-sm text-ivory placeholder:text-[color:var(--lux-ivory)]/40 focus:outline-none focus:ring-2 focus:ring-[rgba(212,175,55,0.35)]";
const lbl = "text-xs text-platinum mb-1 block";
const FONTS = ["Playfair Display", "Crimson Text", "Montserrat", "Figtree", "Fredoka", "Source Code Pro", "Roboto Mono"];
const SIZES = [{ label: "Compact", value: 0.92 }, { label: "Default", value: 1 }, { label: "Comfortable", value: 1.06 }, { label: "Large", value: 1.12 }];
const THEME_DEFAULTS = { font_display: "Playfair Display", font_body: "Montserrat", font_scale: 1, gold: "#D4AF37", bg_dark: "#0F1012", bg_light: "#FBF9F4", hero_text: "#F7F3EE" };
const PRESETS = [
  { name: "Classic Gold", theme: { font_display: "Playfair Display", font_body: "Montserrat", font_scale: 1, gold: "#D4AF37", bg_dark: "#0F1012", bg_light: "#FBF9F4", hero_text: "#F7F3EE" } },
  { name: "Emerald Luxe", theme: { font_display: "Playfair Display", font_body: "Figtree", font_scale: 1, gold: "#2E8B6F", bg_dark: "#0E1413", bg_light: "#F4F8F5", hero_text: "#F4FBF7" } },
  { name: "Sapphire Night", theme: { font_display: "Crimson Text", font_body: "Montserrat", font_scale: 1, gold: "#4F7FC4", bg_dark: "#0D1017", bg_light: "#F4F7FC", hero_text: "#EEF3FB" } },
  { name: "Terracotta Warm", theme: { font_display: "Playfair Display", font_body: "Montserrat", font_scale: 1.02, gold: "#C06A3B", bg_dark: "#141010", bg_light: "#FBF5F0", hero_text: "#FBF2EA" } },
  { name: "Mono Minimal", theme: { font_display: "Figtree", font_body: "Figtree", font_scale: 1, gold: "#9A8C6F", bg_dark: "#101011", bg_light: "#F6F5F2", hero_text: "#F5F3EF" } },
];

export default function AdminContent() {
  const [c, setC] = useState(null);
  const [saving, setSaving] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiBusy, setAiBusy] = useState(false);

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
  // appearance / theme helpers
  const t = { ...THEME_DEFAULTS, ...(c.theme || {}) };
  const setTheme = (k, v) => setC((p) => ({ ...p, theme: { ...THEME_DEFAULTS, ...(p.theme || {}), [k]: v } }));
  const resetTheme = () => setC((p) => ({ ...p, theme: { ...THEME_DEFAULTS } }));
  const applyPreset = (preset) => setC((p) => ({ ...p, theme: { ...THEME_DEFAULTS, ...preset.theme } }));
  const setAi = (k, v) => setC((p) => ({ ...p, ai: { ...(p.ai || {}), [k]: v } }));
  const genTheme = async () => {
    if (!aiPrompt.trim()) { toast.error("Describe the look you want"); return; }
    setAiBusy(true);
    try {
      const { theme } = await adminAiDesign(aiPrompt.trim());
      if (theme && Object.keys(theme).length) {
        setC((p) => ({ ...p, theme: { ...THEME_DEFAULTS, ...(p.theme || {}), ...theme } }));
        toast.success("Theme generated — review below and press Save Changes");
      } else { toast.error("No theme returned, try rephrasing"); }
    } catch { toast.error("AI generation failed"); } finally { setAiBusy(false); }
  };

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
          <TabsTrigger value="appearance" data-testid="admin-content-tab-appearance">Appearance</TabsTrigger>
          <TabsTrigger value="contact">Contact & Social</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6 space-y-4 max-w-2xl">
          <div><label className={lbl}>Brand Name</label><input className={cls} value={c.brand_name || ""} onChange={(e) => set("brand_name", e.target.value)} /></div>
          <div><label className={lbl}>Brand Tagline</label><input className={cls} value={c.brand_tagline || ""} onChange={(e) => set("brand_tagline", e.target.value)} /></div>
          <div><label className={lbl}>Founding Year</label><input className={cls} value={c.founding_year || ""} onChange={(e) => set("founding_year", e.target.value)} /></div>
          <div><FileUpload label="Site Logo (header & footer)" value={c.site_logo || ""} onChange={(v) => set("site_logo", v)} testid="admin-content-logo" /><p className="text-xs text-[color:var(--lux-ivory)]/40 mt-1">Leave empty to use the default Homeland logo.</p></div>
          <div><FileUpload label="Light-mode Logo (dark ink, for day mode)" value={c.site_logo_light || ""} onChange={(v) => set("site_logo_light", v)} testid="admin-content-logo-light" /><p className="text-xs text-[color:var(--lux-ivory)]/40 mt-1">Shown automatically in day mode. Leave empty to use the auto-generated dark-ink logo.</p></div>
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

        <TabsContent value="appearance" className="mt-6 space-y-6 max-w-2xl">
          <p className="text-xs text-[color:var(--lux-ivory)]/50">Customise the site's premium fonts, text size and colours. Changes apply across the whole website after you save.</p>

          <div className="rounded-2xl border border-[color:var(--border-gold)] bg-[rgba(212,175,55,0.05)] p-5">
            <div className="flex items-center gap-2 mb-1"><Wand2 className="h-4 w-4 text-gold" /><h3 className="text-sm font-semibold text-ivory">AI Design Assistant</h3></div>
            <p className="text-xs text-[color:var(--lux-ivory)]/55 mb-3">Describe the look you want and AI will fill the fonts and colours below. Then press Save Changes to apply.</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input className={cls} value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="e.g. warm, earthy and modern for a Goa beach project" data-testid="admin-ai-design-prompt" />
              <button onClick={genTheme} disabled={aiBusy} data-testid="admin-ai-design-generate" className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl border gold-line bg-[rgba(212,175,55,0.12)] px-5 py-2.5 text-sm font-semibold text-gold hover:bg-[rgba(212,175,55,0.2)] disabled:opacity-60">{aiBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate</button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              <div>
                <label className={lbl}>AI Provider</label>
                <Select value={(c.ai && c.ai.provider) || "openai"} onValueChange={(v) => setAi("provider", v)}>
                  <SelectTrigger className={cls} data-testid="admin-ai-provider"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[color:var(--lux-charcoal)] border-[color:var(--border-hairline)] text-ivory">
                    <SelectItem value="openai">OpenAI (ChatGPT)</SelectItem>
                    <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                    <SelectItem value="gemini">Google (Gemini)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className={lbl}>Model</label>
                <input className={cls} value={(c.ai && c.ai.model) || ""} onChange={(e) => setAi("model", e.target.value)} placeholder="e.g. gpt-5.4 / claude-sonnet-5-5 / gemini-3.1-pro-preview" data-testid="admin-ai-model" />
              </div>
            </div>
            <p className="text-[11px] text-[color:var(--lux-ivory)]/40 mt-2">Powers the AI assistant and the website chatbot. Leave the model blank to use the default (gpt-5.4).</p>
          </div>

          <div>
            <div className="kicker mb-3">One-tap Presets</div>
            <div className="flex flex-wrap gap-2.5">
              {PRESETS.map((pr) => (
                <button
                  key={pr.name}
                  onClick={() => applyPreset(pr)}
                  data-testid={`admin-theme-preset-${pr.name.toLowerCase().replace(/\s+/g, "-")}`}
                  className="group inline-flex items-center gap-2.5 rounded-xl bg-glass hairline px-3.5 py-2.5 text-sm text-ivory hover:border-[color:var(--border-gold)] transition-colors"
                >
                  <span className="flex -space-x-1">
                    <span className="h-4 w-4 rounded-full border border-black/20" style={{ background: pr.theme.gold }} />
                    <span className="h-4 w-4 rounded-full border border-black/20" style={{ background: pr.theme.bg_dark }} />
                  </span>
                  {pr.name}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[color:var(--lux-ivory)]/40 mt-2">Tap a preset to fill the fonts and colours below, then press Save Changes to apply it site-wide.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Heading Font</label>
              <Select value={t.font_display} onValueChange={(v) => setTheme("font_display", v)}>
                <SelectTrigger className={cls} data-testid="admin-theme-font-display"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[color:var(--lux-charcoal)] border-[color:var(--border-hairline)] text-ivory">{FONTS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className={lbl}>Body Font</label>
              <Select value={t.font_body} onValueChange={(v) => setTheme("font_body", v)}>
                <SelectTrigger className={cls} data-testid="admin-theme-font-body"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[color:var(--lux-charcoal)] border-[color:var(--border-hairline)] text-ivory">{FONTS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className={lbl}>Text Size</label>
            <Select value={String(t.font_scale)} onValueChange={(v) => setTheme("font_scale", parseFloat(v))}>
              <SelectTrigger className={cls} data-testid="admin-theme-font-scale"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[color:var(--lux-charcoal)] border-[color:var(--border-hairline)] text-ivory">{SIZES.map((s) => <SelectItem key={s.value} value={String(s.value)}>{s.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className={lbl}>Accent / Gold</label>
              <div className="flex items-center gap-2">
                <input type="color" value={t.gold} onChange={(e) => setTheme("gold", e.target.value)} className="h-10 w-12 rounded-lg bg-transparent border border-[color:var(--border-hairline)] cursor-pointer" data-testid="admin-theme-gold" />
                <input className={cls} value={t.gold} onChange={(e) => setTheme("gold", e.target.value)} />
              </div>
            </div>
            <div>
              <label className={lbl}>Dark Background</label>
              <div className="flex items-center gap-2">
                <input type="color" value={t.bg_dark} onChange={(e) => setTheme("bg_dark", e.target.value)} className="h-10 w-12 rounded-lg bg-transparent border border-[color:var(--border-hairline)] cursor-pointer" data-testid="admin-theme-bg-dark" />
                <input className={cls} value={t.bg_dark} onChange={(e) => setTheme("bg_dark", e.target.value)} />
              </div>
            </div>
            <div>
              <label className={lbl}>Light Background</label>
              <div className="flex items-center gap-2">
                <input type="color" value={t.bg_light} onChange={(e) => setTheme("bg_light", e.target.value)} className="h-10 w-12 rounded-lg bg-transparent border border-[color:var(--border-hairline)] cursor-pointer" data-testid="admin-theme-bg-light" />
                <input className={cls} value={t.bg_light} onChange={(e) => setTheme("bg_light", e.target.value)} />
              </div>
            </div>
          </div>

          <div className="max-w-xs">
            <label className={lbl}>Hero Text Colour (over slider photos)</label>
            <div className="flex items-center gap-2">
              <input type="color" value={t.hero_text} onChange={(e) => setTheme("hero_text", e.target.value)} className="h-10 w-12 rounded-lg bg-transparent border border-[color:var(--border-hairline)] cursor-pointer" data-testid="admin-theme-hero-text" />
              <input className={cls} value={t.hero_text} onChange={(e) => setTheme("hero_text", e.target.value)} />
            </div>
            <p className="text-[11px] text-[color:var(--lux-ivory)]/40 mt-1">Used for the big headline and tagline over the home hero images. Keep it light for best contrast over photos.</p>
          </div>

          <div className="rounded-xl bg-glass hairline p-5">
            <div className="kicker mb-2">Preview</div>
            <div style={{ fontFamily: `var(--font-display)` }} className="text-2xl text-ivory">{t.font_display} heading</div>
            <p style={{ fontFamily: `var(--font-body)` }} className="text-sm text-[color:var(--lux-ivory)]/70 mt-1">Body text in {t.font_body}. The accent colour appears on <span style={{ color: t.gold }} className="font-semibold">buttons and links</span>.</p>
            <p className="text-[11px] text-[color:var(--lux-ivory)]/40 mt-2">Live preview updates fully across the site after you press Save Changes.</p>
          </div>

          <button onClick={resetTheme} data-testid="admin-theme-reset" className="text-sm text-[color:var(--lux-ivory)]/70 hover:text-gold underline underline-offset-4">Reset to default theme</button>
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
          <div className="pt-4 border-t border-[color:var(--border-hairline)]">
            <h3 className="text-sm font-semibold text-ivory mb-1">Instagram Feed (auto-updating)</h3>
            <p className="text-xs text-[color:var(--lux-ivory)]/50 mb-3">Paste the embed code from a free widget service (Behold, SnapWidget or EmbedSocial). Your latest posts then appear automatically on the Updates page. Leave empty to hide the feed.</p>
            <textarea rows={5} className={cls} value={c.instagram_embed || ""} onChange={(e) => set("instagram_embed", e.target.value)} placeholder="<script>…</script> or <iframe…> widget code" data-testid="admin-content-instagram-embed" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
