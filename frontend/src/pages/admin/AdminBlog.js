import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { adminGetPosts, adminCreatePost, adminUpdatePost, adminDeletePost } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FileUpload from "@/components/FileUpload";

const EMPTY = { title: "", category: "Blog", excerpt: "", content: "", cover_image: "", author: "Homeland Group", date: "", published: true };
const cls = "w-full rounded-lg bg-[color:var(--lux-charcoal)] border border-[color:var(--border-hairline)] px-3 py-2.5 text-sm text-ivory placeholder:text-[color:var(--lux-ivory)]/40 focus:outline-none focus:ring-2 focus:ring-[rgba(212,175,55,0.35)]";
const lbl = "text-xs text-platinum mb-1 block";

export default function AdminBlog() {
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => adminGetPosts().then(setList).catch(() => toast.error("Failed to load"));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (p) => { setEditing(p); setForm({ ...EMPTY, ...p }); setOpen(true); };
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.title) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      if (editing) { await adminUpdatePost(editing.id, form); toast.success("Post updated"); }
      else { await adminCreatePost(form); toast.success("Post created"); }
      setOpen(false); load();
    } catch { toast.error("Save failed"); } finally { setSaving(false); }
  };
  const del = async (id) => { try { await adminDeletePost(id); toast.success("Deleted"); load(); } catch { toast.error("Delete failed"); } };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-3xl text-ivory">Blog & Media</h1><p className="text-sm text-[color:var(--lux-ivory)]/60 mt-1">Manage News, Media Releases and Blog posts.</p></div>
        <button onClick={openCreate} data-testid="admin-post-create" className="inline-flex items-center gap-2 rounded-xl border gold-line bg-[rgba(212,175,55,0.08)] px-4 py-2.5 text-sm font-semibold text-gold hover:bg-[rgba(212,175,55,0.16)]"><Plus className="h-4 w-4" /> New Post</button>
      </div>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {list.map((p) => (
          <div key={p.id} className="rounded-2xl bg-glass hairline overflow-hidden">
            <div className="aspect-[16/10] overflow-hidden relative">
              <img src={p.cover_image} alt={p.title} className="h-full w-full object-cover" />
              <span className="absolute top-2 left-2 rounded-full bg-black/70 text-gold text-[10px] uppercase tracking-wider px-2 py-0.5">{p.category}</span>
              {!p.published && <span className="absolute top-2 right-2 rounded-full bg-black/70 text-[color:var(--lux-ivory)]/70 text-[10px] px-2 py-0.5 inline-flex items-center gap-1"><EyeOff className="h-3 w-3" /> Draft</span>}
            </div>
            <div className="p-4">
              <div className="text-ivory font-semibold text-sm leading-snug">{p.title}</div>
              <div className="text-xs text-[color:var(--lux-ivory)]/45 mt-1">{p.date}</div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => openEdit(p)} data-testid={`admin-post-edit-${p.slug}`} className="h-8 w-8 grid place-items-center rounded-lg bg-white/5 text-ivory hover:text-gold"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => del(p.id)} className="h-8 w-8 grid place-items-center rounded-lg bg-white/5 text-ivory hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[color:var(--lux-charcoal)] border-[color:var(--border-hairline)] text-ivory">
          <DialogHeader><DialogTitle className="font-display text-2xl">{editing ? "Edit Post" : "New Post"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><label className={lbl}>Title *</label><input className={cls} value={form.title} onChange={(e) => set("title", e.target.value)} data-testid="admin-post-title" /></div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className={lbl}>Category</label>
                <Select value={form.category} onValueChange={(v) => set("category", v)}>
                  <SelectTrigger className={cls}><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[color:var(--lux-charcoal)] border-[color:var(--border-hairline)] text-ivory">{["News", "Media", "Blog"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><label className={lbl}>Date</label><input className={cls} value={form.date} onChange={(e) => set("date", e.target.value)} placeholder="YYYY-MM-DD" /></div>
              <div><label className={lbl}>Author</label><input className={cls} value={form.author} onChange={(e) => set("author", e.target.value)} /></div>
            </div>
            <FileUpload label="Cover Image (upload or URL)" value={form.cover_image} onChange={(v) => set("cover_image", v)} testid="admin-post-cover" />
            <div><label className={lbl}>Excerpt</label><textarea rows={2} className={cls} value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} /></div>
            <div><label className={lbl}>Content (paragraphs separated by new lines)</label><textarea rows={8} className={cls} value={form.content} onChange={(e) => set("content", e.target.value)} /></div>
            <label className="flex items-center gap-2 text-sm text-ivory cursor-pointer"><input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} className="accent-[color:var(--lux-gold)]" /> Published (visible on site)</label>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setOpen(false)} className="rounded-xl bg-white/5 px-5 py-2.5 text-sm text-ivory">Cancel</button>
            <button onClick={save} disabled={saving} data-testid="admin-post-save" className="inline-flex items-center gap-2 rounded-xl border gold-line bg-[rgba(212,175,55,0.08)] px-5 py-2.5 text-sm font-semibold text-gold hover:bg-[rgba(212,175,55,0.16)] disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save Post</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
