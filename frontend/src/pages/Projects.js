import React, { useEffect, useState, useMemo } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import ProjectCard from "@/components/ProjectCard";
import SectionHeading from "@/components/SectionHeading";
import FadeUp from "@/components/FadeUp";
import { getProjects } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUSES = ["All", "ONGOING", "DELIVERED", "UPCOMING"];
const TYPES = ["All", "Residential", "Commercial", "Mixed-Use"];

export default function Projects() {
  const [all, setAll] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [type, setType] = useState("All");
  const [sort, setSort] = useState("order");

  useEffect(() => { getProjects().then(setAll).catch(() => {}); }, []);

  const filtered = useMemo(() => {
    let list = [...all];
    if (status !== "All") list = list.filter((p) => p.status === status);
    if (type !== "All") list = list.filter((p) => p.type === type);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => `${p.name} ${p.location} ${p.city} ${p.type}`.toLowerCase().includes(q));
    }
    if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    else list.sort((a, b) => (a.order || 99) - (b.order || 99));
    return list;
  }, [all, status, type, search, sort]);

  return (
    <div className="pt-10">
      <div className="container-lux">
        <SectionHeading kicker="Portfolio" title="Our Projects" subtitle="Discover premium residential, commercial and mixed-use developments across Punjab and the Tricity." />

        <div className="mt-10 rounded-2xl bg-glass hairline p-4 sm:p-5 sticky top-24 z-30">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--lux-ivory)]/50" />
              <input
                data-testid="projects-search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects, locations…"
                className="w-full rounded-xl bg-[color:var(--lux-charcoal)] border border-[color:var(--border-hairline)] pl-10 pr-4 py-3 text-sm text-ivory placeholder:text-[color:var(--lux-ivory)]/40 focus:outline-none focus:ring-2 focus:ring-[rgba(212,175,55,0.35)]"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger data-testid="projects-status-filter" className="rounded-xl bg-[color:var(--lux-charcoal)] border-[color:var(--border-hairline)] text-ivory py-3"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent className="bg-[color:var(--lux-charcoal)] border-[color:var(--border-hairline)] text-ivory">
                {STATUSES.map((s) => <SelectItem key={s} value={s}>{s === "All" ? "All Status" : s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger data-testid="projects-type-filter" className="rounded-xl bg-[color:var(--lux-charcoal)] border-[color:var(--border-hairline)] text-ivory py-3"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent className="bg-[color:var(--lux-charcoal)] border-[color:var(--border-hairline)] text-ivory">
                {TYPES.map((t) => <SelectItem key={t} value={t}>{t === "All" ? "All Types" : t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <span className="text-sm text-[color:var(--lux-ivory)]/60">{filtered.length} project{filtered.length !== 1 ? "s" : ""}</span>
          <div className="flex items-center gap-2 text-sm text-[color:var(--lux-ivory)]/60">
            <SlidersHorizontal className="h-4 w-4" />
            <button onClick={() => setSort("order")} className={sort === "order" ? "text-gold" : ""}>Featured</button>
            <span className="opacity-30">|</span>
            <button onClick={() => setSort("name")} className={sort === "name" ? "text-gold" : ""}>A–Z</button>
          </div>
        </div>

        <div className="mt-6 pb-24 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((p) => <FadeUp key={p.slug}><ProjectCard project={p} /></FadeUp>)}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-20 text-[color:var(--lux-ivory)]/50">No projects match your filters.</div>
          )}
        </div>
      </div>
    </div>
  );
}
