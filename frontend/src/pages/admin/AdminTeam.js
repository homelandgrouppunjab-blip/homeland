import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getTeam, adminCreateTeam, adminUpdateTeam, adminDeleteTeam } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FileUpload from "@/components/FileUpload";

const EMPTY = { name: "", role: "", expertise: "", bio: "", image: "", order: 99 };
const cls = "w-full rounded-lg bg-[color:var(--lux-charcoal)] border border-[color:var(--border-hairline)] px-3 py-2.5 text-sm text-ivory focus:outline-none focus:ring-2 focus:ring-[rgba(212,175,55,0.35)]";
const lbl = "text-xs text-platinum mb-1 block";

export default function AdminTeam() {
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => getTeam().then(setList).catch(() => {});
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (t) => { setEditing(t); setForm({ ...EMPTY, ...t }); setOpen(true); };
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name) { toast.error("Name required"); return; }
    setSaving(true);
    const payload = { ...form, order: parseInt(form.order) || 99 };
    try {
      if (editing) { await adminUpdateTeam(editing.id, { ...payload, id: editing.id }); toast.success("Updated"); }
      else { await adminCreateTeam(payload); toast.success("Added"); }
      setOpen(false); load();
    } catch { toast.error("Save failed"); } finally { setSaving(false); }
  };
  const del = async (id) => { try { await adminDeleteTeam(id); toast.success("Deleted"); load(); } catch { toast.error("Delete failed"); } };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-3xl text-ivory">Team</h1><p className="text-sm text-[color:var(--lux-ivory)]/60 mt-1">Manage leadership profiles.</p></div>
        <button onClick={openCreate} data-testid="admin-team-create" className="inline-flex items-center gap-2 rounded-xl border gold-line bg-[rgba(212,175,55,0.08)] px-4 py-2.5 text-sm font-semibold text-gold hover:bg-[rgba(212,175,55,0.16)]"><Plus className="h-4 w-4" /> Add Member</button>
      </div>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {list.map((t) => (
          <div key={t.id} className="rounded-2xl bg-glass hairline overflow-hidden">
            <div className="aspect-square overflow-hidden"><img src={t.image} alt={t.name} className="h-full w-full object-cover" /></div>
            <div className="p-4">
              <div className="text-ivory font-semibold">{t.name}</div>
              <div className="text-gold text-sm">{t.role}</div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => openEdit(t)} className="h-8 w-8 grid place-items-center rounded-lg bg-white/5 text-ivory hover:text-gold"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => del(t.id)} className="h-8 w-8 grid place-items-center rounded-lg bg-white/5 text-ivory hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg bg-[color:var(--lux-charcoal)] border-[color:var(--border-hairline)] text-ivory">
          <DialogHeader><DialogTitle className="font-display text-2xl">{editing ? "Edit Member" : "Add Member"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><label className={lbl}>Name</label><input className={cls} value={form.name} onChange={(e) => set("name", e.target.value)} data-testid="admin-team-name" /></div>
            <div><label className={lbl}>Role</label><input className={cls} value={form.role} onChange={(e) => set("role", e.target.value)} /></div>
            <div><label className={lbl}>Expertise (1-line)</label><input className={cls} value={form.expertise} onChange={(e) => set("expertise", e.target.value)} /></div>
            <div><label className={lbl}>Bio</label><textarea rows={4} className={cls} value={form.bio} onChange={(e) => set("bio", e.target.value)} /></div>
            <div><FileUpload label="Photo (upload or URL)" value={form.image} onChange={(v) => set("image", v)} testid="admin-team-image" /></div>
            <div><label className={lbl}>Order</label><input type="number" className={cls} value={form.order} onChange={(e) => set("order", e.target.value)} /></div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setOpen(false)} className="rounded-xl bg-white/5 px-5 py-2.5 text-sm text-ivory">Cancel</button>
            <button onClick={save} disabled={saving} data-testid="admin-team-save" className="inline-flex items-center gap-2 rounded-xl border gold-line bg-[rgba(212,175,55,0.08)] px-5 py-2.5 text-sm font-semibold text-gold">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
