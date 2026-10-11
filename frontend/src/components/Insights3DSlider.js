import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { getPosts } from "@/lib/api";
import SectionHeading from "@/components/SectionHeading";

export const Insights3DSlider = () => {
  const [posts, setPosts] = useState([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    getPosts().then((d) => setPosts((d || []).slice(0, 8))).catch((e) => console.error("Insights slider load failed", e));
  }, []);

  const n = posts.length;
  useEffect(() => {
    if (n <= 1 || paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % n), 3800);
    return () => clearInterval(t);
  }, [n, paused]);

  if (n === 0) return null;

  const step = 360 / n;
  const radius = n <= 2 ? 240 : Math.round(230 / Math.tan(Math.PI / n));
  const go = (d) => setIndex((i) => (i + d + n) % n);

  return (
    <section className="section-pad bg-[color:var(--lux-obsidian)] border-y border-[color:var(--border-hairline)] overflow-hidden" data-testid="insights-3d-slider">
      <div className="container-lux">
        <div className="flex items-end justify-between gap-6 mb-10">
          <SectionHeading kicker="Insights" title="News, Updates & Articles" subtitle="The latest from Homeland Group — project updates, market insights and stories worth sharing." />
          <Link to="/insights" className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-gold" data-testid="insights-viewall-link">View All <ArrowRight className="h-4 w-4" /></Link>
        </div>

        <div
          className="scene-3d relative h-[340px]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className="ring-3d absolute left-1/2 top-1/2"
            style={{ transform: `translate(-50%, -50%) rotateY(${-index * step}deg)` }}
          >
            {posts.map((p, i) => {
              const active = i === index;
              return (
                <Link
                  to={`/insights/${p.slug}`}
                  key={p.slug || i}
                  data-testid={`insight-card-${i}`}
                  className="ring-card absolute left-1/2 top-1/2 block w-[230px] -ml-[115px] -mt-[140px] rounded-2xl overflow-hidden bg-glass"
                  style={{
                    transform: `rotateY(${i * step}deg) translateZ(${radius}px)`,
                    opacity: active ? 1 : 0.42,
                    boxShadow: active ? "0 20px 50px rgba(0,0,0,0.45)" : "none",
                    outline: `1.5px solid ${active ? "var(--lux-gold)" : "var(--border-gold)"}`,
                    outlineOffset: "0px",
                    transition: "opacity 0.6s ease, box-shadow 0.6s ease, outline-color 0.6s ease",
                  }}
                >
                  <div className="h-28 w-full bg-[color:var(--lux-graphite)] overflow-hidden border-b border-[color:var(--border-gold)]">
                    {p.cover_image && <img src={p.cover_image} alt={p.title} className="h-full w-full object-cover" draggable={false} />}
                  </div>
                  <div className="p-4">
                    {p.category && <div className="kicker text-[0.55rem] mb-1.5">{p.category}</div>}
                    <h3 className="font-display text-base text-ivory leading-snug line-clamp-2">{p.title}</h3>
                    {p.excerpt && <p className="mt-1.5 text-xs text-[color:var(--lux-ivory)]/60 line-clamp-2">{p.excerpt}</p>}
                    <span className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-gold">Read more <ArrowRight className="h-3 w-3" /></span>
                  </div>
                </Link>
              );
            })}
          </div>

          {n > 1 && (
            <>
              <button onClick={() => go(-1)} aria-label="Previous" data-testid="insights-prev" className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-10 h-11 w-11 grid place-items-center rounded-full bg-glass hairline text-ivory hover:text-gold hover:border-[color:var(--border-gold)] transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={() => go(1)} aria-label="Next" data-testid="insights-next" className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-10 h-11 w-11 grid place-items-center rounded-full bg-glass hairline text-ivory hover:text-gold hover:border-[color:var(--border-gold)] transition-colors">
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {n > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {posts.map((_, i) => (
              <button key={i} onClick={() => setIndex(i)} aria-label={`Go to slide ${i + 1}`} className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-gold" : "w-1.5 bg-[color:var(--lux-ivory)]/25"}`} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Insights3DSlider;
