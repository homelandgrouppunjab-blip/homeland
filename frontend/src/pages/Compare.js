import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProjects } from "@/lib/api";
import SectionHeading from "@/components/SectionHeading";
import StatusBadge from "@/components/StatusBadge";
import { FileText } from "lucide-react";

const ROWS = [
  ["Status", (p) => <StatusBadge status={p.status} />],
  ["Location", (p) => p.location],
  ["Type", (p) => p.type],
  ["Key Units", (p) => p.key_units],
  ["Price Range", (p) => <span className="text-gold tabular-nums font-semibold">{p.price_range}</span>],
  ["Possession", (p) => p.possession],
  ["RERA", (p) => <span className="tabular-nums text-xs">{(p.rera_numbers || []).join(", ")}</span>],
  ["Amenities", (p) => <span className="text-xs">{(p.amenities || []).slice(0, 4).join(", ")}…</span>],
];

export default function Compare() {
  const [projects, setProjects] = useState([]);
  const [sort, setSort] = useState("order");

  useEffect(() => { getProjects().then(setProjects).catch(() => {}); }, []);

  const sorted = [...projects].sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "status") {
      const r = { ONGOING: 0, DELIVERED: 1, UPCOMING: 2 };
      return (r[a.status] ?? 9) - (r[b.status] ?? 9);
    }
    return (a.order || 99) - (b.order || 99);
  });

  return (
    <div className="pt-10 pb-24">
      <div className="container-lux">
        <SectionHeading kicker="Side-by-Side" title="Compare Projects" subtitle="Compare every Homeland development — completed, ongoing and upcoming — at a glance." />
        <div className="mt-6 flex items-center gap-2 text-sm text-[color:var(--lux-ivory)]/60">
          Sort by:
          <button onClick={() => setSort("order")} data-testid="compare-sort-featured" className={sort === "order" ? "text-gold" : ""}>Featured</button>
          <span className="opacity-30">|</span>
          <button onClick={() => setSort("status")} data-testid="compare-sort-status" className={sort === "status" ? "text-gold" : ""}>Status</button>
          <span className="opacity-30">|</span>
          <button onClick={() => setSort("name")} data-testid="compare-sort-name" className={sort === "name" ? "text-gold" : ""}>Name</button>
        </div>

        <div className="mt-8 overflow-x-auto rounded-2xl hairline bg-glass" data-testid="compare-table">
          <table className="w-full border-collapse min-w-[720px]">
            <thead>
              <tr className="border-b border-[color:var(--border-hairline)]">
                <th className="sticky left-0 z-10 bg-[color:var(--lux-charcoal)] text-left p-4 text-xs uppercase tracking-wider text-[color:var(--lux-ivory)]/60 w-36">Project</th>
                {sorted.map((p) => (
                  <th key={p.slug} className="p-4 text-left min-w-[220px]">
                    <div className="aspect-[16/9] rounded-lg overflow-hidden mb-3"><img src={p.hero_image} alt={p.name} className="h-full w-full object-cover" /></div>
                    <Link to={`/projects/${p.slug}`} className="font-display text-lg text-ivory hover:text-gold">{p.name}</Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([label, render], ri) => (
                <tr key={label} className={`border-b border-[color:var(--border-hairline)] ${ri % 2 ? "bg-white/[0.02]" : ""}`}>
                  <td className="sticky left-0 z-10 bg-[color:var(--lux-charcoal)] p-4 text-xs uppercase tracking-wider text-[color:var(--lux-ivory)]/60">{label}</td>
                  {sorted.map((p) => <td key={p.slug} className="p-4 text-sm text-[color:var(--lux-ivory)]/85 align-top">{render(p)}</td>)}
                </tr>
              ))}
              <tr>
                <td className="sticky left-0 z-10 bg-[color:var(--lux-charcoal)] p-4" />
                {sorted.map((p) => (
                  <td key={p.slug} className="p-4">
                    <Link to={`/projects/${p.slug}`} className="inline-flex items-center gap-2 rounded-lg border gold-line px-3 py-2 text-xs font-semibold text-gold hover:bg-[rgba(212,175,55,0.08)]">Explore</Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
