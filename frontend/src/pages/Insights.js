import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays } from "lucide-react";
import { getPosts } from "@/lib/api";
import SectionHeading from "@/components/SectionHeading";
import FadeUp from "@/components/FadeUp";

const CATS = ["All", "News", "Media", "Blog"];

export default function Insights() {
  const [posts, setPosts] = useState([]);
  const [cat, setCat] = useState("All");

  useEffect(() => { getPosts(cat === "All" ? undefined : cat).then(setPosts).catch(() => {}); }, [cat]);

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="pt-14 pb-24">
      <div className="container-lux">
        <SectionHeading kicker="Insights" title="News, Media & Blog" subtitle="Project updates, industry insights and press coverage from Homeland Group." />

        <div className="mt-8 flex flex-wrap gap-2">
          {CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)} data-testid={`insights-tab-${c.toLowerCase()}`}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${cat === c ? "border-[color:var(--border-gold)] bg-[rgba(212,175,55,0.12)] text-gold" : "border-[color:var(--border-hairline)] text-[color:var(--lux-ivory)]/70 hover:text-ivory"}`}>
              {c}
            </button>
          ))}
        </div>

        {featured && (
          <FadeUp className="mt-10">
            <Link to={`/insights/${featured.slug}`} className="group grid lg:grid-cols-2 gap-8 rounded-2xl bg-glass hairline overflow-hidden lift">
              <div className="aspect-[16/10] lg:aspect-auto overflow-hidden">
                <img src={featured.cover_image} alt={featured.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="p-8 flex flex-col justify-center">
                <div className="flex items-center gap-3 text-xs">
                  <span className="rounded-full bg-[rgba(212,175,55,0.12)] text-gold px-3 py-1 uppercase tracking-wider">{featured.category}</span>
                  <span className="inline-flex items-center gap-1.5 text-[color:var(--lux-ivory)]/50"><CalendarDays className="h-3.5 w-3.5" /> {featured.date}</span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl text-ivory mt-4 leading-snug">{featured.title}</h3>
                <p className="mt-3 text-sm text-[color:var(--lux-ivory)]/65 leading-relaxed">{featured.excerpt}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gold">Read Article <ArrowRight className="h-4 w-4" /></span>
              </div>
            </Link>
          </FadeUp>
        )}

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {rest.map((p) => (
            <FadeUp key={p.slug}>
              <Link to={`/insights/${p.slug}`} className="group block rounded-2xl bg-glass hairline overflow-hidden lift h-full" data-testid={`post-card-${p.slug}`}>
                <div className="aspect-[16/10] overflow-hidden">
                  <img src={p.cover_image} alt={p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="rounded-full bg-[rgba(212,175,55,0.12)] text-gold px-2.5 py-0.5 uppercase tracking-wider">{p.category}</span>
                    <span className="text-[color:var(--lux-ivory)]/45">{p.date}</span>
                  </div>
                  <h4 className="font-display text-lg text-ivory mt-3 leading-snug">{p.title}</h4>
                  <p className="mt-2 text-sm text-[color:var(--lux-ivory)]/60 line-clamp-2">{p.excerpt}</p>
                </div>
              </Link>
            </FadeUp>
          ))}
        </div>
        {posts.length === 0 && <div className="text-center py-20 text-[color:var(--lux-ivory)]/50">No articles yet.</div>}
      </div>
    </div>
  );
}
