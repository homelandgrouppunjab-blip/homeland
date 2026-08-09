import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { adminGetProjects, adminCreateProject, adminUpdateProject, adminDeleteProject } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EMPTY = {
  name: "", tagline: "", status: "UPCOMING", possession: "", location: "", full_address: "", city: "",
  type: "Residential", unit_types: [], key_units: "", price_range: "", rera_numbers: [], rera_registered_date: "",
  rera_certificate_url: "", amenities: [], description: "", highlights: [], hero_image: "", gallery: [], video_url: "",
  brochure_url: "", map_lat: "", map_lng: "", landmarks: [], featured: false, hot_selling: false, order: 99,
};

const cls = "w-full rounded-lg bg-[color:var(--lux-charcoal)] border border-[color:var(--border-hairline)] px-3 py-2.5 text-sm text-ivory placeholder:text-[color:var(--lux-ivory)]/40 focus:outline-none focus:ring-2 focus:ring-[rgba(212,175,55,0.35)]";
const lbl = "text-xs text-platinum mb-1 block";
const toArr = (s) => s.split("\n").map((x) => x.trim()).filter(Boolean);
const fromArr = (a) => (a || []).join("\n");

export default function AdminProjects() {
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [delId, setDelId] = useState(null);

  const load = () => adminGetProjects().then(setList).catch(() => toast.error("Failed to load"));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ ...EMPTY, ...p, map_lat: p.map_lat ?? "", map_lng: p.map_lng ?? "" });
    setOpen(true);
  };
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name) { toast.error("Project name is required"); return; }
    setSaving(true);
    const payload = {
      ...form,
      map_lat: form.map_lat === "" ? null : parseFloat(form.map_lat),
      map_lng: form.map_lng === "" ? null : parseFloat(form.map_lng),
      order: parseInt(form.order) || 99,
    };
    try {
      if (editing) { await adminUpdateProject(editing.id, payload); toast.success("Project updated"); }
      else { await adminCreateProject(payload); toast.success("Project created"); }
      setOpen(false); load();
    } catch (e) { toast.error("Save failed"); } finally { setSaving(false); }
  };

  const doDelete = async () => {
    try { await adminDeleteProject(delId); toast.success("Deleted"); load(); } catch { toast.error("Delete failed"); }
    setDelId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-3xl text-ivory">Projects</h1><p className="text-sm text-[color:var(--lux-ivory)]/60 mt-1">Manage your project portfolio.</p></div>
        <button onClick={openCreate} data-testid="admin-project-create" className="inline-flex items-center gap-2 rounded-xl border gold-line bg-[rgba(212,175,55,0.08)] px-4 py-2.5 text-sm font-semibold text-gold hover:bg-[rgba(212,175,55,0.16)]"><Plus className="h-4 w-4" /> New Project</button>
      </div>

      <div className="mt-8 rounded-2xl bg-glass hairline overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]" data-testid="admin-projects-table">
            <thead><tr className="border-b border-[color:var(--border-hairline)] text-left text-xs uppercase tracking-wider text-[color:var(--lux-ivory)]/60">
              <th className="p-4">Project</th><th className="p-4">Status</th><th className="p-4">Type</th><th className="p-4">Location</th><th className="p-4">Flags</th><th className="p-4 text-right">Actions</th>
            </tr></thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} className="border-b border-[color:var(--border-hairline)]">
                  <td className="p-4"><div className="flex items-center gap-3"><img src={p.hero_image} alt="" className="h-10 w-14 rounded object-cover" /><span className="text-ivory font-medium text-sm">{p.name}</span></div></td>
                  <td className="p-4"><StatusBadge status={p.status} /></td>
                  <td className="p-4 text-sm text-[color:var(--lux-ivory)]/70">{p.type}</td>
                  <td className="p-4 text-sm text-[color:var(--lux-ivory)]/70">{p.location}</td>
                  <td className="p-4 text-xs">{p.featured && <span className="text-platinum mr-2">Featured</span>}{p.hot_selling && <span className="text-gold">Hot</span>}</td>
                  <td className="p-4"><div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(p)} data-testid={`admin-project-edit-${p.slug}`} className="h-8 w-8 grid place-items-center rounded-lg bg-white/5 text-ivory hover:text-gold"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => setDelId(p.id)} className="h-8 w-8 grid place-items-center rounded-lg bg-white/5 text-ivory hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[color:var(--lux-charcoal)] border-[color:var(--border-hairline)] text-ivory">
          <DialogHeader><DialogTitle className="font-display text-2xl">{editing ? "Edit Project" : "New Project"}</DialogTitle></DialogHeader>
          <div className="grid sm:grid-cols-2 gap-4 mt-2">
            <div><label className={lbl}>Name *</label><input className={cls} value={form.name} onChange={(e) => set("name", e.target.value)} data-testid="admin-project-name" /></div>
            <div><label className={lbl}>Tagline</label><input className={cls} value={form.tagline} onChange={(e) => set("tagline", e.target.value)} /></div>
            <div><label className={lbl}>Status</label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}><SelectTrigger className={cls}><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[color:var(--lux-charcoal)] border-[color:var(--border-hairline)] text-ivory">{["DELIVERED","ONGOING","UPCOMING"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
            </div>
            <div><label className={lbl}>Type</label>
              <Select value={form.type} onValueChange={(v) => set("type", v)}><SelectTrigger className={cls}><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[color:var(--lux-charcoal)] border-[color:var(--border-hairline)] text-ivory">{["Residential","Commercial","Mixed-Use"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
            </div>
            <div><label className={lbl}>Location (short)</label><input className={cls} value={form.location} onChange={(e) => set("location", e.target.value)} /></div>
            <div><label className={lbl}>City</label><input className={cls} value={form.city} onChange={(e) => set("city", e.target.value)} /></div>
            <div className="sm:col-span-2"><label className={lbl}>Full Address</label><input className={cls} value={form.full_address} onChange={(e) => set("full_address", e.target.value)} /></div>
            <div><label className={lbl}>Possession</label><input className={cls} value={form.possession} onChange={(e) => set("possession", e.target.value)} /></div>
            <div><label className={lbl}>Price Range</label><input className={cls} value={form.price_range} onChange={(e) => set("price_range", e.target.value)} /></div>
            <div><label className={lbl}>Key Units</label><input className={cls} value={form.key_units} onChange={(e) => set("key_units", e.target.value)} /></div>
            <div><label className={lbl}>Order</label><input type="number" className={cls} value={form.order} onChange={(e) => set("order", e.target.value)} /></div>
            <div><label className={lbl}>Unit Types (one per line)</label><textarea rows={3} className={cls} value={fromArr(form.unit_types)} onChange={(e) => set("unit_types", toArr(e.target.value))} /></div>
            <div><label className={lbl}>RERA Numbers (one per line)</label><textarea rows={3} className={cls} value={fromArr(form.rera_numbers)} onChange={(e) => set("rera_numbers", toArr(e.target.value))} /></div>
            <div><label className={lbl}>RERA Registered Date</label><input className={cls} value={form.rera_registered_date} onChange={(e) => set("rera_registered_date", e.target.value)} placeholder="YYYY-MM-DD" /></div>
            <div><label className={lbl}>Video URL (embed)</label><input className={cls} value={form.video_url} onChange={(e) => set("video_url", e.target.value)} /></div>
            <div className="sm:col-span-2"><label className={lbl}>Description</label><textarea rows={4} className={cls} value={form.description} onChange={(e) => set("description", e.target.value)} /></div>
            <div><label className={lbl}>Highlights (one per line)</label><textarea rows={4} className={cls} value={fromArr(form.highlights)} onChange={(e) => set("highlights", toArr(e.target.value))} /></div>
            <div><label className={lbl}>Amenities (one per line)</label><textarea rows={4} className={cls} value={fromArr(form.amenities)} onChange={(e) => set("amenities", toArr(e.target.value))} /></div>
            <div className="sm:col-span-2"><label className={lbl}>Hero Image URL</label><input className={cls} value={form.hero_image} onChange={(e) => set("hero_image", e.target.value)} /></div>
            <div className="sm:col-span-2"><label className={lbl}>Gallery Image URLs (one per line)</label><textarea rows={3} className={cls} value={fromArr(form.gallery)} onChange={(e) => set("gallery", toArr(e.target.value))} /></div>
            <div><label className={lbl}>Brochure URL</label><input className={cls} value={form.brochure_url} onChange={(e) => set("brochure_url", e.target.value)} /></div>
            <div><label className={lbl}>Landmarks (one per line)</label><textarea rows={3} className={cls} value={fromArr(form.landmarks)} onChange={(e) => set("landmarks", toArr(e.target.value))} /></div>
            <div><label className={lbl}>Map Latitude</label><input className={cls} value={form.map_lat} onChange={(e) => set("map_lat", e.target.value)} placeholder="30.6788" /></div>
            <div><label className={lbl}>Map Longitude</label><input className={cls} value={form.map_lng} onChange={(e) => set("map_lng", e.target.value)} placeholder="76.7369" /></div>
            <div className="flex items-center gap-6 sm:col-span-2 pt-1">
              <label className="flex items-center gap-2 text-sm text-ivory cursor-pointer"><input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="accent-[color:var(--lux-gold)]" /> Featured</label>
              <label className="flex items-center gap-2 text-sm text-ivory cursor-pointer"><input type="checkbox" checked={form.hot_selling} onChange={(e) => set("hot_selling", e.target.checked)} className="accent-[color:var(--lux-gold)]" /> Hot Selling</label>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setOpen(false)} className="rounded-xl bg-white/5 px-5 py-2.5 text-sm text-ivory">Cancel</button>
            <button onClick={save} disabled={saving} data-testid="admin-project-save" className="inline-flex items-center gap-2 rounded-xl border gold-line bg-[rgba(212,175,55,0.08)] px-5 py-2.5 text-sm font-semibold text-gold hover:bg-[rgba(212,175,55,0.16)] disabled:opacity-60">{saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Save Project"}</button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!delId} onOpenChange={(o) => !o && setDelId(null)}>
        <AlertDialogContent className="bg-[color:var(--lux-charcoal)] border-[color:var(--border-hairline)] text-ivory">
          <AlertDialogHeader><AlertDialogTitle>Delete this project?</AlertDialogTitle><AlertDialogDescription className="text-[color:var(--lux-ivory)]/60">This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel className="bg-white/5 border-0 text-ivory">Cancel</AlertDialogCancel><AlertDialogAction onClick={doDelete} className="bg-destructive text-white">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
