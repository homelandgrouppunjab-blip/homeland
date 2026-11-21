import React, { useMemo, useState } from "react";
import { Sparkles, CheckCircle2, Tag } from "lucide-react";
import Seo from "@/components/Seo";
import SectionHeading from "@/components/SectionHeading";
import FadeUp from "@/components/FadeUp";
import { CATEGORIES, MILESTONES, CHANGELOG } from "@/data/buildHistory";

const CATEGORY_LABEL = CATEGORIES.reduce((m, c) => { m[c.key] = c.label; return m; }, {});

export default function WhatsNew() {
  const [filter, setFilter] = useState("all");

  const entries = useMemo(
    () => (filter === "all" ? CHANGELOG : CHANGELOG.filter((e) => e.category === filter)),
    [filter]
  );

  // Only show filter chips for categories that actually have entries.
  const activeCategories = useMemo(() => {
    const present = new Set(CHANGELOG.map((e) => e.category));
    return CATEGORIES.filter((c) => present.has(c.key));
  }, []);

  return (
    <div data-testid="whats-new-page">
      <Seo
        title="What's New"
        description="A dated record of how the Homeland Group Mohali website has been built and improved over time — projects, imagery, SEO, enquiries, chat and more."
        path="/whats-new"
      />

      {/* Hero */}
      <section className="relative pt-28 pb-14 border-b border-[color:var(--border-hairline)]">
        <div className="container-lux">
          <SectionHeading
            kicker="Build History"
            title="What's New"
            subtitle="A clear, dated record of how this website has grown — from its first pages to the latest refinements. Start with the milestones below, then explore the full changelog."
          />
        </div>
      </section>

      {/* Milestones */}
      <section className="py-16">
        <div className="container-lux">
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="h-5 w-5 text-gold" />
            <h2 className="font-display text-2xl sm:text-3xl text-ivory">Milestones</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" data-testid="whats-new-milestones">
            {MILESTONES.map((m, idx) => (
              <FadeUp key={m.title} delay={idx * 0.05}>
                <div className="h-full rounded-2xl bg-glass hairline p-6">
                  <CheckCircle2 className="h-6 w-6 text-gold mb-4" />
                  <h3 className="font-display text-lg text-ivory leading-snug">{m.title}</h3>
                  <p className="mt-3 text-sm text-[color:var(--lux-ivory)]/65 leading-relaxed">{m.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <div className="container-lux"><div className="gold-divider" /></div>

      {/* Changelog */}
      <section className="py-16">
        <div className="container-lux">
          <div className="flex items-center gap-2 mb-6">
            <Tag className="h-5 w-5 text-gold" />
            <h2 className="font-display text-2xl sm:text-3xl text-ivory">Changelog</h2>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2.5 mb-10" role="tablist" aria-label="Filter changelog by category" data-testid="whats-new-filters">
            <FilterChip active={filter === "all"} onClick={() => setFilter("all")} testid="filter-all">
              All
            </FilterChip>
            {activeCategories.map((c) => (
              <FilterChip
                key={c.key}
                active={filter === c.key}
                onClick={() => setFilter(c.key)}
                testid={`filter-${c.key}`}
              >
                {c.label}
              </FilterChip>
            ))}
          </div>

          {/* Timeline */}
          <div className="relative border-l border-[color:var(--border-hairline)] pl-6 sm:pl-8 space-y-7" data-testid="whats-new-timeline">
            {entries.map((e, idx) => (
              <FadeUp key={e.id} delay={Math.min(idx * 0.04, 0.2)}>
                <article className="relative rounded-2xl bg-glass hairline p-6" data-testid={`changelog-entry-${e.id}`}>
                  <span
                    className="absolute -left-[31px] sm:-left-[39px] top-7 h-3 w-3 rounded-full bg-gold ring-4 ring-[color:var(--lux-obsidian)]"
                    aria-hidden="true"
                  />
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="inline-flex items-center rounded-full border border-[color:var(--border-gold)] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-gold">
                      {CATEGORY_LABEL[e.category] || e.category}
                    </span>
                    <span className="text-xs text-[color:var(--lux-ivory)]/50">
                      {e.date}{e.stage ? ` \u00B7 ${e.stage}` : ""}
                    </span>
                  </div>
                  <h3 className="font-display text-xl text-ivory leading-snug">{e.title}</h3>
                  <p className="mt-3 text-sm sm:text-[15px] text-[color:var(--lux-ivory)]/70 leading-relaxed">{e.desc}</p>
                </article>
              </FadeUp>
            ))}

            {entries.length === 0 && (
              <p className="text-sm text-[color:var(--lux-ivory)]/60" data-testid="whats-new-empty">
                No entries in this category yet.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

const FilterChip = ({ active, onClick, children, testid }) => (
  <button
    type="button"
    role="tab"
    aria-selected={active}
    onClick={onClick}
    data-testid={testid}
    className={[
      "rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--border-gold)]",
      active
        ? "bg-gold text-[color:var(--lux-obsidian)] border border-[color:var(--border-gold)]"
        : "bg-glass hairline text-[color:var(--lux-ivory)]/70 hover:text-gold hover:border-[color:var(--border-gold)]",
    ].join(" ")}
  >
    {children}
  </button>
);
