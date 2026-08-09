import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StatusBadge from "@/components/StatusBadge";
import LogoPlaque from "@/components/LogoPlaque";

export const HeroSlider = ({ projects = [] }) => {
  const [i, setI] = useState(0);
  const n = projects.length;

  const next = useCallback(() => setI((v) => (v + 1) % n), [n]);
  const prev = () => setI((v) => (v - 1 + n) % n);

  useEffect(() => {
    if (n < 2) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next, n]);

  if (!n) return <div className="h-[70vh] bg-[color:var(--lux-charcoal)]" />;
  const p = projects[i];

  return (
    <section className="relative h-[88vh] min-h-[560px] w-full overflow-hidden" data-testid="hero-slider">
      <AnimatePresence mode="wait">
        <motion.div
          key={p.slug}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <img src={p.hero_image} alt={p.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />
          <div className="absolute inset-0 hero-atmosphere" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 h-full container-lux flex flex-col justify-end pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={p.slug + "-text"}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-3 mb-5">
              <StatusBadge status={p.status} />
              {p.hot_selling && <span className="rounded-full bg-[rgba(212,175,55,0.15)] border border-[rgba(212,175,55,0.4)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold">Hot Selling</span>}
            </div>
            {p.logo_image ? (
              <LogoPlaque src={p.logo_image} alt={p.name} size="lg" />
            ) : (
              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl leading-[1.02] text-ivory">{p.name}</h1>
            )}
            <p className="mt-4 text-base sm:text-lg text-[color:var(--lux-ivory)]/80 max-w-2xl">{p.tagline}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to={`/projects/${p.slug}`} data-testid="hero-explore-button" className="inline-flex items-center gap-2 rounded-xl border gold-line bg-[rgba(212,175,55,0.08)] px-6 py-3.5 text-sm font-semibold tracking-wide text-gold hover:bg-[rgba(212,175,55,0.16)] transition-colors">
                Explore Project <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/contact" data-testid="hero-schedule-visit-button" className="inline-flex items-center gap-2 rounded-xl bg-glass hairline px-6 py-3.5 text-sm font-semibold text-ivory hover:bg-[color:var(--surface-glass-strong)] transition-colors">
                Schedule a Visit
              </Link>
              <Link to="/brochures" data-testid="hero-brochure-button" className="inline-flex items-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold text-[color:var(--lux-ivory)]/80 hover:text-gold transition-colors">
                <FileText className="h-4 w-4" /> Download Brochure
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-8 left-0 right-0 z-10 container-lux flex items-center justify-between">
        <div className="flex gap-2">
          {projects.map((_, idx) => (
            <button key={idx} aria-label={`Slide ${idx + 1}`} onClick={() => setI(idx)}
              className={`h-1 rounded-full transition-all ${idx === i ? "w-10 bg-gold" : "w-5 bg-white/30"}`} />
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={prev} aria-label="Previous project" className="h-11 w-11 grid place-items-center rounded-full bg-glass hairline text-ivory hover:text-gold transition-colors"><ChevronLeft className="h-5 w-5" /></button>
          <button onClick={next} aria-label="Next project" data-testid="hero-next-button" className="h-11 w-11 grid place-items-center rounded-full bg-glass hairline text-ivory hover:text-gold transition-colors"><ChevronRight className="h-5 w-5" /></button>
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
