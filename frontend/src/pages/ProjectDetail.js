import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, FileText, ShieldCheck, Check, Copy, Play, ChevronLeft, ChevronRight, X, Home, Ruler, CalendarClock, Building2 } from "lucide-react";
import { toast } from "sonner";
import { getProject, getProjects } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import ProjectMap from "@/components/ProjectMap";
import LogoPlaque from "@/components/LogoPlaque";
import EnquiryForm from "@/components/EnquiryForm";
import FadeUp from "@/components/FadeUp";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function ProjectDetail() {
  const { slug } = useParams();
  const [p, setP] = useState(null);
  const [all, setAll] = useState([]);
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(-1);

  useEffect(() => {
    window.scrollTo(0, 0);
    getProject(slug).then((d) => { setP(d); setActive(0); }).catch(() => setP(null));
    getProjects().then(setAll).catch(() => {});
  }, [slug]);

  if (!p) return <div className="container-lux py-40 text-center text-[color:var(--lux-ivory)]/50">Loading project…</div>;

  const images = [p.hero_image, ...(p.gallery || [])].filter(Boolean);
  const copyRera = (r) => { navigator.clipboard.writeText(r); toast.success("RERA number copied"); };

  const stats = [
    { icon: Building2, label: "Type", value: p.type },
    { icon: Home, label: "Configurations", value: (p.unit_types || []).join(", ") || "—" },
    { icon: CalendarClock, label: "Possession", value: p.possession },
    { icon: Ruler, label: "Price", value: p.price_range },
  ];

  return (
    <div>
      {/* Hero */}
      <div className="relative h-[70vh] min-h-[480px]">
        <img src={images[active]} alt={p.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="container-lux pb-10">
            {p.logo_image && (
              <div className="mb-5">
                <LogoPlaque src={p.logo_image} alt={`${p.name} logo`} size="md" />
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <StatusBadge status={p.status} />
              {p.status === "UPCOMING" && (
                <span data-testid="detail-under-designing" className="rounded-full bg-[rgba(198,169,105,0.12)] border border-[rgba(212,175,55,0.4)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold">Under Designing</span>
              )}
              {p.hot_selling && <span className="rounded-full bg-[rgba(212,175,55,0.15)] border border-[rgba(212,175,55,0.4)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold">Hot Selling</span>}
              {p.featured && <span className="rounded-full bg-white/10 border border-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-platinum">Featured</span>}
            </div>
            <h1 className="font-display text-4xl sm:text-6xl text-ivory leading-tight max-w-4xl">{p.name}</h1>
            <div className="mt-3 flex items-center gap-2 text-[color:var(--lux-ivory)]/80"><MapPin className="h-4 w-4 text-gold" /> {p.full_address || p.location}</div>
          </div>
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="container-lux -mt-8 relative z-10">
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {images.map((img, i) => (
              <button key={i} onClick={() => setActive(i)} className={`shrink-0 h-16 w-24 rounded-lg overflow-hidden border-2 transition-colors ${i === active ? "border-[color:var(--lux-gold)]" : "border-transparent opacity-70 hover:opacity-100"}`}>
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="container-lux py-14 grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          {/* Tagline + CTAs */}
          <FadeUp>
            <div className="kicker mb-2">{p.type} · {p.location}</div>
            <p className="font-display text-2xl text-ivory leading-snug">{p.tagline}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {p.brochure_url ? (
                <a href={p.brochure_url} target="_blank" rel="noreferrer" data-testid="detail-brochure-button" className="inline-flex items-center gap-2 rounded-xl border gold-line bg-[rgba(212,175,55,0.08)] px-5 py-3 text-sm font-semibold text-gold hover:bg-[rgba(212,175,55,0.16)] transition-colors"><FileText className="h-4 w-4" /> Download Brochure</a>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-xl bg-glass hairline px-5 py-3 text-sm text-[color:var(--lux-ivory)]/60"><FileText className="h-4 w-4" /> Brochure Coming Soon</span>
              )}
              <button onClick={() => setLightbox(0)} data-testid="detail-gallery-button" className="inline-flex items-center gap-2 rounded-xl bg-glass hairline px-5 py-3 text-sm font-semibold text-ivory hover:bg-[color:var(--surface-glass-strong)] transition-colors">View Gallery ({images.length})</button>
            </div>
          </FadeUp>

          {/* RERA block */}
          <FadeUp>
            <div className="mt-8 rounded-2xl border gold-line bg-[rgba(212,175,55,0.05)] p-5" data-testid="detail-rera-block">
              <div className="flex items-center gap-2 text-gold text-sm font-semibold"><ShieldCheck className="h-5 w-5" /> RERA Registered</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(p.rera_numbers || []).map((r, i) => (
                  <button key={i} onClick={() => copyRera(r)} className="inline-flex items-center gap-2 rounded-lg bg-[color:var(--lux-charcoal)] border border-[color:var(--border-hairline)] px-3 py-2 text-sm text-ivory tabular-nums hover:border-[color:var(--border-gold)] transition-colors">
                    {r} <Copy className="h-3.5 w-3.5 opacity-60" />
                  </button>
                ))}
              </div>
              {p.rera_registered_date && <div className="text-xs text-[color:var(--lux-ivory)]/55 mt-2">Registered on {p.rera_registered_date}</div>}
            </div>
          </FadeUp>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <div key={i} className="rounded-xl bg-glass hairline p-4">
                <s.icon className="h-5 w-5 text-gold" />
                <div className="text-xs text-[color:var(--lux-ivory)]/55 mt-3">{s.label}</div>
                <div className="text-sm text-ivory font-semibold mt-0.5">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Tabs: Overview / Amenities / Location */}
          <Tabs defaultValue="overview" className="mt-10">
            <TabsList className="bg-[color:var(--lux-charcoal)] border border-[color:var(--border-hairline)]">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="amenities" data-testid="tab-amenities">Amenities</TabsTrigger>
              <TabsTrigger value="location" data-testid="tab-location">Location</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-6">
              <p className="text-[color:var(--lux-ivory)]/75 leading-relaxed">{p.description}</p>
              {(p.highlights || []).length > 0 && (
                <div className="mt-6 grid sm:grid-cols-2 gap-3">
                  {p.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-[color:var(--lux-ivory)]/80">
                      <Check className="h-4 w-4 text-gold mt-0.5 shrink-0" /> {h}
                    </div>
                  ))}
                </div>
              )}
              {p.video_url && (
                <div className="mt-8 rounded-2xl overflow-hidden hairline aspect-video">
                  <iframe title="walkthrough" src={p.video_url} className="w-full h-full" allowFullScreen />
                </div>
              )}
            </TabsContent>
            <TabsContent value="amenities" className="mt-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(p.amenities || []).map((a, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl bg-glass hairline px-4 py-3 text-sm text-[color:var(--lux-ivory)]/80">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold" /> {a}
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="location" className="mt-6">
              <ProjectMap points={[p]} center={p.map_lat ? [p.map_lat, p.map_lng] : undefined} zoom={14} height="400px" />
              {(p.landmarks || []).length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {p.landmarks.map((l, i) => (
                    <span key={i} className="inline-flex items-center gap-2 rounded-full bg-glass hairline px-3 py-1.5 text-xs text-[color:var(--lux-ivory)]/75"><MapPin className="h-3 w-3 text-gold" /> {l}</span>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar enquiry */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl bg-glass hairline p-6">
            <div className="text-gold text-sm font-semibold">Interested in {p.name}?</div>
            <p className="text-xs text-[color:var(--lux-ivory)]/60 mt-1 mb-5">Register your interest — our team will reach out.</p>
            <EnquiryForm projects={all} defaultProject={p.name} compact />
          </div>
        </div>
      </div>

      {/* Related */}
      <section className="section-pad bg-[color:var(--lux-obsidian)] border-t border-[color:var(--border-hairline)]">
        <div className="container-lux">
          <h2 className="font-display text-2xl text-ivory mb-8">More Developments</h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {all.filter((x) => x.slug !== p.slug).slice(0, 5).map((x) => (
              <Link key={x.slug} to={`/projects/${x.slug}`} className="shrink-0 w-72 rounded-2xl overflow-hidden bg-glass hairline lift">
                <div className="aspect-[4/3] overflow-hidden"><img src={x.hero_image} alt={x.name} className="h-full w-full object-cover" /></div>
                <div className="p-4"><div className="text-ivory font-semibold text-sm">{x.name}</div><div className="text-xs text-gold mt-1">{x.location}</div></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <Dialog open={lightbox >= 0} onOpenChange={(o) => !o && setLightbox(-1)}>
        <DialogContent className="max-w-5xl bg-[color:var(--lux-charcoal)] border-[color:var(--border-hairline)] p-2">
          {lightbox >= 0 && (
            <div className="relative">
              <img src={images[lightbox]} alt="" className="w-full max-h-[80vh] object-contain rounded-lg" />
              <button onClick={() => setLightbox((v) => (v - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 grid place-items-center rounded-full bg-black/60 text-ivory"><ChevronLeft className="h-5 w-5" /></button>
              <button onClick={() => setLightbox((v) => (v + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 grid place-items-center rounded-full bg-black/60 text-ivory"><ChevronRight className="h-5 w-5" /></button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-ivory/80 bg-black/60 rounded-full px-3 py-1">{lightbox + 1} / {images.length}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
