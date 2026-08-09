import React from "react";
import { Link } from "react-router-dom";
import { MapPin, ArrowRight, FileText, ShieldCheck } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

export const ProjectCard = ({ project }) => {
  const p = project;
  return (
    <div data-testid={`project-card-${p.slug}`} className="group rounded-2xl overflow-hidden bg-glass hairline lift flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={p.hero_image}
          alt={p.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        {p.logo_image && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[color:var(--border-gold)] shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-[#F7F3EE] px-4 py-3">
            <img src={p.logo_image} alt={`${p.name} logo`} loading="lazy" className="h-12 w-auto block object-contain" />
          </div>
        )}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <StatusBadge status={p.status} />
          {p.status === "UPCOMING" && (
            <span
              data-testid={`project-card-under-designing-${p.slug}`}
              className="rounded-full bg-[rgba(198,169,105,0.12)] border border-[rgba(212,175,55,0.4)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold backdrop-blur-md"
            >
              Under Designing
            </span>
          )}
        </div>
        {p.hot_selling && (
          <div className="absolute top-4 right-4 rounded-full bg-[rgba(212,175,55,0.15)] border border-[rgba(212,175,55,0.4)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold backdrop-blur-md">
            Hot Selling
          </div>
        )}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-1.5 text-xs text-[color:var(--lux-ivory)]/80">
            <MapPin className="h-3.5 w-3.5 text-gold" /> {p.location}
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] uppercase tracking-wider text-[color:var(--lux-ivory)]/50">{p.type}</span>
          <span className="text-sm font-semibold text-gold tabular-nums">{p.price_range}</span>
        </div>
        <h3 className="font-display text-xl text-ivory mt-2 leading-snug">{p.name}</h3>
        <p className="mt-1.5 text-sm text-[color:var(--lux-ivory)]/60">{p.key_units}</p>

        <div className="mt-4 flex items-center gap-2 rounded-lg border border-[rgba(212,175,55,0.2)] bg-[rgba(212,175,55,0.05)] px-3 py-2">
          <ShieldCheck className="h-4 w-4 text-gold shrink-0" />
          <span data-testid={`project-card-rera-${p.slug}`} className="text-xs text-[color:var(--lux-ivory)]/80 tabular-nums truncate">
            RERA: {(p.rera_numbers && p.rera_numbers[0]) || "In Process"}
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 pt-4 border-t border-[color:var(--border-hairline)]">
          <Link
            to={`/projects/${p.slug}`}
            data-testid={`project-explore-${p.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-ivory hover:text-gold transition-colors"
          >
            Explore <ArrowRight className="h-4 w-4" />
          </Link>
          <span className="text-xs text-[color:var(--lux-ivory)]/50">{p.possession}</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
