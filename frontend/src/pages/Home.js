import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Award, Users, Building2, Clock, Ruler, ShieldCheck } from "lucide-react";
import HeroSlider from "@/components/HeroSlider";
import ProjectCard from "@/components/ProjectCard";
import SectionHeading from "@/components/SectionHeading";
import FadeUp from "@/components/FadeUp";
import ProjectMap from "@/components/ProjectMap";
import EnquiryForm from "@/components/EnquiryForm";
import { getProjects, getContent, getTeam } from "@/lib/api";

const ICONS = { award: Award, users: Users, "building-2": Building2, clock: Clock, ruler: Ruler, "shield-check": ShieldCheck };

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [content, setContent] = useState(null);
  const [team, setTeam] = useState([]);

  useEffect(() => {
    getProjects().then(setProjects).catch(() => {});
    getProjects({ featured: true }).then(setFeatured).catch(() => {});
    getContent().then(setContent).catch(() => {});
    getTeam().then(setTeam).catch(() => {});
  }, []);

  return (
    <div>
      <HeroSlider projects={projects} />

      {/* Intro / History */}
      <section className="section-pad container-lux">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <SectionHeading
            kicker={`Established ${content?.founding_year || 2013}`}
            title="A Legacy of Iconic Living"
            subtitle={content?.history_intro}
          />
          <FadeUp delay={0.1}>
            <div className="grid grid-cols-2 gap-4">
              {(content?.benchmark_kpis || []).slice(0, 4).map((k, idx) => {
                const Icon = ICONS[k.icon] || Award;
                return (
                  <div key={idx} className="rounded-2xl bg-glass hairline p-6">
                    <Icon className="h-6 w-6 text-gold" />
                    <div className="mt-4 font-display text-3xl text-ivory tabular-nums">{k.value}</div>
                    <div className="text-xs text-[color:var(--lux-ivory)]/60 mt-1">{k.label}</div>
                  </div>
                );
              })}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Featured */}
      <section className="section-pad bg-[color:var(--lux-obsidian)] border-y border-[color:var(--border-hairline)]">
        <div className="container-lux">
          <div className="flex items-end justify-between gap-6 mb-12">
            <SectionHeading kicker="Hot Selling" title="Featured Properties" subtitle="Our most sought-after addresses, crafted for the discerning few." />
            <Link to="/projects" className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-gold hover:gap-3 transition-all">View All <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {featured.map((p) => <FadeUp key={p.slug}><ProjectCard project={p} /></FadeUp>)}
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section className="section-pad container-lux">
        <SectionHeading align="center" kicker="Our Portfolio" title="Explore Our Developments" subtitle="From delivered landmarks to ongoing masterpieces and upcoming icons." />
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.slice(0, 6).map((p) => <FadeUp key={p.slug}><ProjectCard project={p} /></FadeUp>)}
        </div>
        <div className="mt-12 text-center">
          <Link to="/projects" data-testid="home-view-all-projects" className="inline-flex items-center gap-2 rounded-xl border gold-line px-6 py-3.5 text-sm font-semibold text-gold hover:bg-[rgba(212,175,55,0.08)] transition-colors">
            View All Projects <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Benchmark KPI strip */}
      <section className="section-pad bg-[color:var(--lux-obsidian)] border-y border-[color:var(--border-hairline)]">
        <div className="container-lux">
          <SectionHeading align="center" kicker="Benchmark & Performance" title="Numbers That Define Trust" />
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-3 gap-4">
            {(content?.benchmark_kpis || []).map((k, idx) => {
              const Icon = ICONS[k.icon] || Award;
              return (
                <FadeUp key={idx} delay={idx * 0.05}>
                  <div className="rounded-2xl bg-glass hairline p-6 h-full">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-gold" />
                      <div className="font-display text-3xl text-ivory tabular-nums">{k.value}</div>
                    </div>
                    <div className="text-sm text-ivory mt-3 font-semibold">{k.label}</div>
                    <div className="text-xs text-[color:var(--lux-ivory)]/55 mt-1">{k.description}</div>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-pad container-lux">
        <SectionHeading kicker="Our Journey" title="Milestones That Shaped Us" />
        <div className="mt-12 grid md:grid-cols-2 gap-x-16">
          {(content?.milestones || []).map((m, idx) => (
            <FadeUp key={idx} delay={idx * 0.05}>
              <div className="relative pl-8 pb-10 border-l border-[color:var(--border-hairline)]">
                <span className="absolute -left-[7px] top-1 h-3.5 w-3.5 rounded-full bg-gold ring-4 ring-[rgba(212,175,55,0.2)]" />
                <div className="text-gold font-display text-2xl">{m.year}</div>
                <div className="text-ivory font-semibold mt-1">{m.title}</div>
                <p className="text-sm text-[color:var(--lux-ivory)]/60 mt-1.5">{m.description}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* Locations map preview */}
      <section className="section-pad bg-[color:var(--lux-obsidian)] border-y border-[color:var(--border-hairline)]">
        <div className="container-lux">
          <div className="flex items-end justify-between gap-6 mb-10">
            <SectionHeading kicker="Locations" title="Find Us Across the Tricity" subtitle="Explore our projects on the map — from Mohali to New Chandigarh and beyond." />
            <Link to="/locations" className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-gold">Open Map <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <ProjectMap points={projects} height="460px" />
        </div>
      </section>

      {/* Vision + Team preview */}
      <section className="section-pad container-lux">
        <div className="grid lg:grid-cols-2 gap-14 items-start">
          <div>
            <SectionHeading kicker="Our Vision" title="Building the Future of Living" subtitle={content?.vision_statement} />
            <div className="mt-8 space-y-3">
              {(content?.vision_pillars || []).slice(0, 5).map((p, idx) => (
                <FadeUp key={idx} delay={idx * 0.05}>
                  <div className="flex items-start gap-4 rounded-xl bg-glass hairline p-4">
                    <div className="h-8 w-8 shrink-0 grid place-items-center rounded-full bg-[rgba(212,175,55,0.12)] text-gold text-sm font-semibold">{idx + 1}</div>
                    <div>
                      <div className="text-ivory font-semibold text-sm">{p.title}</div>
                      <div className="text-xs text-[color:var(--lux-ivory)]/60 mt-0.5">{p.description}</div>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
          <div>
            <SectionHeading kicker="Leadership" title="The Minds Behind Homeland" />
            <div className="mt-8 grid sm:grid-cols-2 gap-5">
              {team.slice(0, 4).map((t) => (
                <FadeUp key={t.id}>
                  <div className="rounded-2xl bg-glass hairline overflow-hidden lift">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img src={t.image} alt={t.name} loading="lazy" className="h-full w-full object-cover" />
                    </div>
                    <div className="p-4">
                      <div className="text-ivory font-semibold text-sm">{t.name}</div>
                      <div className="text-gold text-xs mt-0.5">{t.role}</div>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
            <Link to="/vision" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gold">Meet the full team <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      {/* Lead capture */}
      <section className="section-pad bg-[color:var(--lux-obsidian)] border-t border-[color:var(--border-hairline)]">
        <div className="container-lux grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <SectionHeading kicker="Enquire Now" title="Begin Your Homeland Journey" subtitle="Share your details and our relationship managers will curate the perfect address for you." />
            <div className="mt-8 space-y-4">
              {(content?.vision_pillars || []).slice(0, 3).map((p, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-[color:var(--lux-ivory)]/70">
                  <ShieldCheck className="h-4 w-4 text-gold" /> {p.title}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-glass hairline p-6 sm:p-8">
            <EnquiryForm projects={projects} />
          </div>
        </div>
      </section>
    </div>
  );
}
