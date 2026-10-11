import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Pin, Instagram, Facebook, Linkedin, Youtube, Twitter, Share2, ExternalLink } from "lucide-react";
import { getPosts, getUpdates, getContent } from "@/lib/api";
import SectionHeading from "@/components/SectionHeading";
import FadeUp from "@/components/FadeUp";
import SocialEmbed from "@/components/SocialEmbed";

const FILTERS = ["All", "Updates", "Events", "Social", "News", "Media", "Blog"];
const PLATFORM_ICON = { Instagram, Facebook, LinkedIn: Linkedin, YouTube: Youtube, "Twitter/X": Twitter, Other: Share2 };

export default function Updates() {
  const [posts, setPosts] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [embed, setEmbed] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getUpdates().catch(() => []), getPosts().catch(() => [])])
      .then(([u, p]) => { setUpdates(u || []); setPosts(p || []); })
      .finally(() => setLoading(false));
    getContent().then((c) => setEmbed(c?.instagram_embed || "")).catch(() => {});
  }, []);

  const items = useMemo(() => {
    const u = (updates || []).map((x) => ({
      key: `upd-${x.id}`,
      kind: x.link_type === "social" ? "Social" : (x.category === "Event" ? "Events" : "Updates"),
      title: x.title,
      excerpt: x.excerpt || x.body,
      image: x.image,
      category: x.category || "Update",
      date: x.date,
      pinned: !!x.pinned,
      platform: x.link_type === "social" ? (x.social_platform || "Other") : null,
      to: x.link_type === "project" && x.project_slug ? `/projects/${x.project_slug}` : null,
      external: (x.link_type === "external" || x.link_type === "social") ? x.external_url : null,
    }));
    const p = (posts || []).map((x) => ({
      key: `post-${x.slug}`,
      kind: x.category === "Media" ? "Media" : x.category === "News" ? "News" : "Blog",
      title: x.title,
      excerpt: x.excerpt,
      image: x.cover_image,
      category: x.category || "Blog",
      date: x.date,
      pinned: false,
      to: `/insights/${x.slug}`,
      external: null,
    }));
    const merged = [...u, ...p];
    const filtered = filter === "All" ? merged : merged.filter((m) => m.kind === filter);
    return filtered.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (b.date || "").localeCompare(a.date || ""));
  }, [updates, posts, filter]);

  const Card = ({ it }) => {
    const PIcon = it.platform ? (PLATFORM_ICON[it.platform] || Share2) : null;
    const inner = (
      <article className="group h-full rounded-2xl overflow-hidden bg-glass hairline lift">
        <div className="relative aspect-[16/10] overflow-hidden bg-[color:var(--lux-graphite)]">
          {it.image && <img src={it.image} alt={it.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />}
          <span className="absolute top-3 left-3 rounded-full bg-black/70 text-gold text-[10px] uppercase tracking-wider px-2.5 py-1">{it.category}</span>
          {PIcon && <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/70 text-gold text-[10px] px-2 py-1"><PIcon className="h-3 w-3" /> {it.platform}</span>}
          {it.pinned && !PIcon && <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-[rgba(212,175,55,0.9)] text-[#1b1710] text-[10px] font-semibold uppercase tracking-wider px-2 py-1"><Pin className="h-3 w-3" /> Pinned</span>}
        </div>
        <div className="p-5">
          <div className="flex items-center gap-1.5 text-xs text-[color:var(--lux-ivory)]/50"><CalendarDays className="h-3.5 w-3.5" /> {it.date}</div>
          <h3 className="font-display text-lg text-ivory leading-snug mt-2">{it.title}</h3>
          {it.excerpt && <p className="mt-2 text-sm text-[color:var(--lux-ivory)]/65 line-clamp-3">{it.excerpt}</p>}
          {it.external ? (
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold">{it.platform ? `View on ${it.platform}` : "Visit link"} <ExternalLink className="h-3.5 w-3.5" /></span>
          ) : it.to ? (
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold">Read more <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
          ) : null}
        </div>
      </article>
    );
    if (it.external) return <a href={it.external} target="_blank" rel="noreferrer" className="block h-full" data-testid={`update-card-${it.key}`}>{inner}</a>;
    if (it.to) return <Link to={it.to} className="block h-full" data-testid={`update-card-${it.key}`}>{inner}</Link>;
    return <div className="block h-full" data-testid={`update-card-${it.key}`}>{inner}</div>;
  };

  return (
    <div className="pt-14 pb-24" data-testid="updates-page">
      <div className="container-lux">
        <SectionHeading kicker="Daily Updates" title="Updates, News & Articles" subtitle="One place for everything new at Homeland Group — project launches and milestones alongside our latest press, media and blog stories." />

        <div className="mt-8 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} data-testid={`updates-tab-${f.toLowerCase()}`}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${filter === f ? "border-[color:var(--border-gold)] bg-[rgba(212,175,55,0.12)] text-gold" : "border-[color:var(--border-hairline)] text-[color:var(--lux-ivory)]/70 hover:text-ivory"}`}>
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-glass hairline overflow-hidden">
                <div className="aspect-[16/10] bg-[color:var(--lux-graphite)] animate-pulse" />
                <div className="p-5 space-y-3"><div className="h-3 w-24 bg-white/10 rounded animate-pulse" /><div className="h-4 w-full bg-white/10 rounded animate-pulse" /><div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" /></div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24 text-[color:var(--lux-ivory)]/50" data-testid="updates-empty">Nothing to show here yet. Please check back soon.</div>
        ) : (
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((it) => (
              <FadeUp key={it.key}><Card it={it} /></FadeUp>
            ))}
          </div>
        )}

        {embed && (
          <div className="mt-20 pt-12 border-t border-[color:var(--border-hairline)]" data-testid="updates-instagram-section">
            <SectionHeading kicker="Instagram" title="Follow Our Journey" subtitle="Live from @homelandgroup — our latest reels, launches and site moments." />
            <div className="mt-8"><SocialEmbed code={embed} /></div>
          </div>
        )}
      </div>
    </div>
  );
}
