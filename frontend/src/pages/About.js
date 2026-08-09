import React, { useEffect, useState } from "react";
import { getContent } from "@/lib/api";
import SectionHeading from "@/components/SectionHeading";
import FadeUp from "@/components/FadeUp";

export default function About() {
  const [c, setC] = useState(null);
  useEffect(() => { getContent().then(setC).catch(() => {}); }, []);

  return (
    <div>
      <div className="relative h-[46vh] min-h-[320px]">
        <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80" alt="Homeland Group" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />
        <div className="absolute inset-0 flex items-end"><div className="container-lux pb-10"><div className="kicker mb-2">Since {c?.founding_year || 2013}</div><h1 className="font-display text-4xl sm:text-6xl text-ivory">Our Story</h1></div></div>
      </div>

      <section className="section-pad container-lux">
        <div className="max-w-3xl">
          <SectionHeading kicker="About Homeland Group" title="A Legacy Built on Trust" />
          <p className="mt-6 text-[color:var(--lux-ivory)]/75 leading-relaxed text-lg">{c?.history_intro}</p>
        </div>
      </section>

      <section className="section-pad bg-[color:var(--lux-obsidian)] border-y border-[color:var(--border-hairline)]">
        <div className="container-lux">
          <SectionHeading kicker="Our Journey" title="Milestones Through the Years" />
          <div className="mt-12 grid md:grid-cols-2 gap-x-16">
            {(c?.milestones || []).map((m, i) => (
              <FadeUp key={i} delay={i * 0.05}>
                <div className="relative pl-8 pb-10 border-l border-[color:var(--border-hairline)]">
                  <span className="absolute -left-[7px] top-1 h-3.5 w-3.5 rounded-full bg-gold ring-4 ring-[rgba(212,175,55,0.2)]" />
                  <div className="text-gold font-display text-2xl">{m.year}</div>
                  <div className="text-ivory font-semibold mt-1">{m.title}</div>
                  <p className="text-sm text-[color:var(--lux-ivory)]/60 mt-1.5">{m.description}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
