import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, EyeOff, Pin } from "lucide-react";
import { toast } from "sonner";
import { adminGetUpdates, adminCreateUpdate, adminUpdateUpdate, adminDeleteUpdate, adminGetProjects } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import FileUpload from "@/components/FileUpload";

const EMPTY = { title: "", category: "Update", excerpt: "", body: "", image: "", link_type: "none", project_slug: "", external_url: "", social_platform: "Instagram", venue: "", date: "", pinned: false, published: true };
const CATEGORIES = ["Update", "Launch", "Milestone", "Price", "Event", "News", "Social"];
const PLATFORMS = ["Instagram", "Facebook", "LinkedIn", "YouTube", "Twitter/X", "Other"];
const cls = "w-full rounded-lg bg-[color:var(--lux-charcoal)] border border-[color:var(--border-hairline)] px-3 py-2.5 text-sm text-ivory placeholder:text-[color:var(--lux-ivory)]/40 focus:outline-none focus:ring-2 focus:ring-[rgba(212,175,55,0.35)]";
const lbl = "text-xs text-platinum mb-1 block";

export default function AdminUpdates() {
  const [list, setList] = useState([]);
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => adminGetUpdates().then(setList).catch(() => toast.error("Failed to load"));
  useEffect(() => { load(); adminGetProjects().then(setProjects).catch(() => {}); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (p) => { setEditing(p); setForm({ ...EMPTY, ...p }); setOpen(true); };
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.title) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      if (editing) { await adminUpdateUpdate(editing.id, form); toast.success("Update saved"); }
      else { await adminCreateUpdate(form); toast.success("Update created"); }
      setOpen(false); load();
    } catch { toast.error("Save failed"); } finally { setSaving(false); }
  };
  const del = async (id) => { try { await adminDeleteUpdate(id); toast.success("Deleted"); load(); } catch { toast.error("Delete failed"); } };

  const quickToggle = async (p, key) => {
    const next = !p[key];
    setList((l) => l.map((x) => (x.id === p.id ? { ...x, [key]: next } : x)));
    try { await adminUpdateUpdate(p.id, { ...p, [key]: next }); }
    catch { toast.error("Update failed"); load(); }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-3xl text-ivory">Daily Updates</h1><p className="text-sm text-[color:var(--lux-ivory)]/60 mt-1">Short, dated project news that appears in the Updates feed and the home carousel.</p></div>
        <button onClick={openCreate} data-testid="admin-update-create" className="inline-flex items-center gap-2 rounded-xl border gold-line bg-[rgba(212,175,55,0.08)] px-4 py-2.5 text-sm font-semibold text-gold hover:bg-[rgba(212,175,55,0.16)]"><Plus className="h-4 w-4" /> New Update</button>
      </div>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {list.map((p) => (
          <div key={p.id} className="rounded-2xl bg-glass hairline overflow-hidden flex flex-col">
            <div className="aspect-[16/10] overflow-hidden relative bg-[color:var(--lux-graphite)]">
              {p.image && <img src={p.image} alt={p.title} className="h-full w-full object-cover" />}
              <span className="absolute top-2 left-2 rounded-full bg-black/70 text-gold text-[10px] uppercase tracking-wider px-2 py-0.5">{p.category}</span>
              {p.pinned && <span className="absolute top-2 right-2 rounded-full bg-[rgba(212,175,55,0.9)] text-[#1b1710] text-[10px] px-2 py-0.5 inline-flex items-center gap-1"><Pin className="h-3 w-3" /> Pinned</span>}
              {!p.published && <span className="absolute bottom-2 right-2 rounded-full bg-black/70 text-[color:var(--lux-ivory)]/70 text-[10px] px-2 py-0.5 inline-flex items-center gap-1"><EyeOff className="h-3 w-3" /> Hidden</span>}
            </div>
            <div className="p-4 flex flex-col flex-1">
              <div className="text-ivory font-semibold text-sm leading-snug">{p.title}</div>
              <div className="text-xs text-[color:var(--lux-ivory)]/45 mt-1">{p.date}</div>
              <div className="mt-3 pt-3 border-t border-[color:var(--border-hairline)] space-y-2">
                <label className="flex items-center justify-between text-xs text-[color:var(--lux-ivory)]/75">
                  <span>Visible on site</span>
                  <Switch checked={!!p.published} onCheckedChange={() => quickToggle(p, "published")} data-testid={`admin-update-toggle-published-${p.id}`} />
                </label>
                <label className="flex items-center justify-between text-xs text-[color:var(--lux-ivory)]/75">
                  <span>Pin to top</span>
                  <Switch checked={!!p.pinned} onCheckedChange={() => quickToggle(p, "pinned")} data-testid={`admin-update-toggle-pinned-${p.id}`} />
                </label>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => openEdit(p)} data-testid={`admin-update-edit-${p.id}`} className="h-8 w-8 grid place-items-center rounded-lg bg-white/5 text-ivory hover:text-gold"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => del(p.id)} className="h-8 w-8 grid place-items-center rounded-lg bg-white/5 text-ivory hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {list.length === 0 && <div className="col-span-full text-center py-16 text-[color:var(--lux-ivory)]/50">No updates yet. Create your first update to populate the feed.</div>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[color:var(--lux-charcoal)] border-[color:var(--border-hairline)] text-ivory">
          <DialogHeader><DialogTitle className="font-display text-2xl">{editing ? "Edit Update" : "New Update"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><label className={lbl}>Title *</label><input className={cls} value={form.title} onChange={(e) => set("title", e.target.value)} data-testid="admin-update-title" /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Category</label>
                <Select value={form.category} onValueChange={(v) => set("category", v)}>
                  <SelectTrigger className={cls}><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[color:var(--lux-charcoal)] border-[color:var(--border-hairline)] text-ivory">{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><label className={lbl}>Date</label><input className={cls} value={form.date} onChange={(e) => set("date", e.target.value)} placeholder="YYYY-MM-DD" /></div>
            </div>
            <FileUpload label="Image (upload or URL)" value={form.image} onChange={(v) => set("image", v)} testid="admin-update-image" />
            {form.category === "Event" && (
              <div><label className={lbl}>Venue / Location</label><input className={cls} value={form.venue} onChange={(e) => set("venue", e.target.value)} placeholder="e.g. Homeland Regalia Experience Centre, Mohali" data-testid="admin-update-venue" /><p className="text-xs text-[color:var(--lux-ivory)]/40 mt-1">Shown on the Events spotlight banner with the date and an RSVP button. Pin the event to feature it.</p></div>
            )}
            <div><label className={lbl}>Short summary</label><textarea rows={2} className={cls} value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} /></div>
            <div><label className={lbl}>Full text (optional)</label><textarea rows={5} className={cls} value={form.body} onChange={(e) => set("body", e.target.value)} /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Links to</label>
                <Select value={form.link_type} onValueChange={(v) => set("link_type", v)}>
                  <SelectTrigger className={cls}><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[color:var(--lux-charcoal)] border-[color:var(--border-hairline)] text-ivory">
                    <SelectItem value="none">No link</SelectItem>
                    <SelectItem value="project">A project page</SelectItem>
                    <SelectItem value="external">External URL</SelectItem>
                    <SelectItem value="social">Social media post</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.link_type === "project" && (
                <div>
                  <label className={lbl}>Project</label>
                  <Select value={form.project_slug} onValueChange={(v) => set("project_slug", v)}>
                    <SelectTrigger className={cls}><SelectValue placeholder="Select project" /></SelectTrigger>
                    <SelectContent className="bg-[color:var(--lux-charcoal)] border-[color:var(--border-hairline)] text-ivory">{projects.map((p) => <SelectItem key={p.slug} value={p.slug}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              {form.link_type === "external" && (
                <div><label className={lbl}>External URL</label><input className={cls} value={form.external_url} onChange={(e) => set("external_url", e.target.value)} placeholder="https://…" /></div>
              )}
              {form.link_type === "social" && (
                <div>
                  <label className={lbl}>Platform</label>
                  <Select value={form.social_platform} onValueChange={(v) => set("social_platform", v)}>
                    <SelectTrigger className={cls} data-testid="admin-update-platform"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[color:var(--lux-charcoal)] border-[color:var(--border-hairline)] text-ivory">{PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
            </div>
            {form.link_type === "social" && (
              <div><label className={lbl}>Paste the post link</label><input className={cls} value={form.external_url} onChange={(e) => set("external_url", e.target.value)} placeholder="Paste Instagram / Facebook / YouTube link…" data-testid="admin-update-social-url" /><p className="text-xs text-[color:var(--lux-ivory)]/40 mt-1">The card will open this link in a new tab with the platform badge.</p></div>
            )}
            <div className="flex flex-wrap items-center gap-6 pt-1">
              <label className="flex items-center gap-2 text-sm text-ivory cursor-pointer"><Switch checked={form.published} onCheckedChange={(v) => set("published", v)} data-testid="admin-update-published" /> Visible on site</label>
              <label className="flex items-center gap-2 text-sm text-ivory cursor-pointer"><Switch checked={form.pinned} onCheckedChange={(v) => set("pinned", v)} data-testid="admin-update-pinned" /> Pin to top</label>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setOpen(false)} className="rounded-xl bg-white/5 px-5 py-2.5 text-sm text-ivory">Cancel</button>
            <button onClick={save} disabled={saving} data-testid="admin-update-save" className="inline-flex items-center gap-2 rounded-xl border gold-line bg-[rgba(212,175,55,0.08)] px-5 py-2.5 text-sm font-semibold text-gold hover:bg-[rgba(212,175,55,0.16)] disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save Update</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
