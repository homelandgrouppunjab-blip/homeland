import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, FileText, Download } from "lucide-react";
import { getBrochures } from "@/lib/api";
import SectionHeading from "@/components/SectionHeading";
import StatusBadge from "@/components/StatusBadge";
import FadeUp from "@/components/FadeUp";

export default function Brochures() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  useEffect(() => { getBrochures().then(setItems).catch(() => {}); }, []);
  const filtered = useMemo(() => items.filter((i) => `${i.project} ${i.location} ${i.type}`.toLowerCase().includes(q.toLowerCase())), [items, q]);

  return (
    <div className="pt-14 pb-24">
      <div className="container-lux">
        <SectionHeading kicker="Download Center" title="Brochure Center" subtitle="Download detailed brochures for every Homeland development." />
        <div className="mt-8 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--lux-ivory)]/50" />
          <input data-testid="brochures-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search brochures…" className="w-full rounded-xl bg-[color:var(--lux-charcoal)] border border-[color:var(--border-hairline)] pl-10 pr-4 py-3 text-sm text-ivory placeholder:text-[color:var(--lux-ivory)]/40 focus:outline-none focus:ring-2 focus:ring-[rgba(212,175,55,0.35)]" />
        </div>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((b) => (
            <FadeUp key={b.slug}>
              <div className="rounded-2xl bg-glass hairline overflow-hidden lift" data-testid={`brochure-card-${b.slug}`}>
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img src={b.hero_image} alt={b.project} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute top-3 left-3"><StatusBadge status={b.status} /></div>
                </div>
                <div className="p-5">
                  <div className="text-ivory font-semibold">{b.project}</div>
                  <div className="text-xs text-gold mt-1">{b.location} · {b.type}</div>
                  <div className="mt-4 flex items-center gap-2">
                    {b.brochure_url ? (
                      <a href={b.brochure_url} target="_blank" rel="noreferrer" data-testid={`brochure-download-${b.slug}`} className="inline-flex items-center gap-2 rounded-lg border gold-line px-4 py-2 text-xs font-semibold text-gold hover:bg-[rgba(212,175,55,0.08)]"><Download className="h-3.5 w-3.5" /> Download</a>
                    ) : (
                      <Link to="/contact" className="inline-flex items-center gap-2 rounded-lg bg-glass hairline px-4 py-2 text-xs font-semibold text-[color:var(--lux-ivory)]/70"><FileText className="h-3.5 w-3.5" /> Request Brochure</Link>
                    )}
                    <Link to={`/projects/${b.slug}`} className="text-xs text-[color:var(--lux-ivory)]/60 hover:text-gold">View Project</Link>
                  </div>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </div>
  );
}
