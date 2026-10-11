import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Play, Pause, CalendarDays } from "lucide-react";
import { getPosts, getUpdates } from "@/lib/api";
import SectionHeading from "@/components/SectionHeading";

const usePerView = () => {
  const [pv, setPv] = useState(3);
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      setPv(w < 640 ? 1 : w < 1024 ? 2 : 3);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  return pv;
};

// Clean, bright card carousel combining project Updates + Insights articles.
export const Insights3DSlider = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hover, setHover] = useState(false);
  const perView = usePerView();
  const trackRef = useRef(null);

  useEffect(() => {
    Promise.all([getUpdates().catch(() => []), getPosts().catch(() => [])]).then(([updates, posts]) => {
      const u = (updates || []).map((x) => ({
        key: `upd-${x.id}`,
        kind: "Update",
        title: x.title,
        excerpt: x.excerpt,
        image: x.image,
        category: x.category || "Update",
        date: x.date,
        to: x.link_type === "project" && x.project_slug ? `/projects/${x.project_slug}` : "/updates",
        external: (x.link_type === "external" || x.link_type === "social") ? x.external_url : null,
      }));
      const p = (posts || []).map((x) => ({
        key: `post-${x.slug}`,
        kind: "Article",
        title: x.title,
        excerpt: x.excerpt,
        image: x.cover_image,
        category: x.category || "Article",
        date: x.date,
        to: `/insights/${x.slug}`,
        external: null,
      }));
      const merged = [...u, ...p].sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 9);
      setItems(merged);
    });
  }, []);

  const n = items.length;
  const pages = Math.max(1, Math.ceil(n / perView));

  useEffect(() => {
    if (page > pages - 1) setPage(0);
  }, [pages, page]);

  const go = useCallback((d) => setPage((pg) => (pg + d + pages) % pages), [pages]);

  useEffect(() => {
    if (!playing || hover || pages <= 1) return;
    const t = setInterval(() => setPage((pg) => (pg + 1) % pages), 4500);
    return () => clearInterval(t);
  }, [playing, hover, pages]);

  const cardWidth = useMemo(() => `${100 / perView}%`, [perView]);

  if (n === 0) return null;

  return (
    <section className="section-pad bg-[color:var(--lux-obsidian)] border-y border-[color:var(--border-hairline)] overflow-hidden" data-testid="insights-slider">
      <div className="container-lux">
        <div className="flex items-end justify-between gap-6 mb-10">
          <SectionHeading kicker="Insights" title="News, Updates & Articles" subtitle="The latest from Homeland Group — project updates, market insights and stories worth sharing." />
          <Link to="/updates" className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-gold shrink-0" data-testid="insights-viewall-link">View All <ArrowRight className="h-4 w-4" /></Link>
        </div>

        <div
          className="relative"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <div className="overflow-hidden">
            <div
              ref={trackRef}
              className="flex"
              style={{ transform: `translateX(-${page * 100}%)`, transition: "transform 0.6s cubic-bezier(0.22,1,0.36,1)" }}
            >
              {items.map((it, i) => {
                const Inner = (
                  <article
                    className="group h-full rounded-2xl overflow-hidden bg-glass border border-[color:var(--border-gold)] shadow-[0_10px_30px_rgba(0,0,0,0.18)] hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(0,0,0,0.26)] transition-transform duration-200"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-[color:var(--lux-graphite)]">
                      {it.image && <img src={it.image} alt={it.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" draggable={false} />}
                      <span className="absolute top-3 left-3 rounded-full bg-black/70 text-gold text-[10px] uppercase tracking-wider px-2.5 py-1">{it.category}</span>
                    </div>
                    <div className="p-5">
                      {it.date && <div className="flex items-center gap-1.5 text-xs text-[color:var(--lux-ivory)]/50"><CalendarDays className="h-3.5 w-3.5" /> {it.date}</div>}
                      <h3 className="font-display text-lg text-ivory leading-snug mt-2 line-clamp-2">{it.title}</h3>
                      {it.excerpt && <p className="mt-2 text-sm text-[color:var(--lux-ivory)]/65 line-clamp-2">{it.excerpt}</p>}
                      <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-gold">Read more <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
                    </div>
                  </article>
                );
                return (
                  <div key={it.key} className="px-3 flex-none" style={{ flex: `0 0 ${cardWidth}`, maxWidth: cardWidth }} data-testid={`insight-card-${i}`}>
                    {it.external ? (
                      <a href={it.external} target="_blank" rel="noreferrer" className="block h-full">{Inner}</a>
                    ) : (
                      <Link to={it.to} className="block h-full">{Inner}</Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {pages > 1 && (
            <>
              <button onClick={() => go(-1)} aria-label="Previous" data-testid="insights-prev" className="absolute -left-2 sm:-left-5 top-[38%] -translate-y-1/2 z-10 h-11 w-11 grid place-items-center rounded-full bg-[color:var(--surface-glass-strong)] backdrop-blur-md hairline text-ivory hover:text-gold hover:border-[color:var(--border-gold)] transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={() => go(1)} aria-label="Next" data-testid="insights-next" className="absolute -right-2 sm:-right-5 top-[38%] -translate-y-1/2 z-10 h-11 w-11 grid place-items-center rounded-full bg-[color:var(--surface-glass-strong)] backdrop-blur-md hairline text-ivory hover:text-gold hover:border-[color:var(--border-gold)] transition-colors">
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 mt-6">
          {pages > 1 && (
            <button
              onClick={() => setPlaying((v) => !v)}
              aria-label={playing ? "Pause slideshow" : "Play slideshow"}
              data-testid="insights-autoplay-toggle"
              className="h-9 w-9 grid place-items-center rounded-full bg-glass hairline text-ivory hover:text-gold hover:border-[color:var(--border-gold)] transition-colors"
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          )}
          {pages > 1 && (
            <div className="flex gap-2">
              {Array.from({ length: pages }).map((_, i) => (
                <button key={i} onClick={() => setPage(i)} aria-label={`Go to page ${i + 1}`} data-testid={`insights-dot-${i}`} className={`h-1.5 rounded-full transition-all ${i === page ? "w-6 bg-gold" : "w-1.5 bg-[color:var(--lux-ivory)]/25"}`} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Insights3DSlider;
