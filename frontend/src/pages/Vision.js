import React, { useEffect, useState } from "react";
import { getContent, getTeam } from "@/lib/api";
import SectionHeading from "@/components/SectionHeading";
import FadeUp from "@/components/FadeUp";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function Vision() {
  const [c, setC] = useState(null);
  const [team, setTeam] = useState([]);
  useEffect(() => {
    getContent().then(setC).catch(() => {});
    getTeam().then(setTeam).catch(() => {});
  }, []);

  return (
    <div>
      <section className="section-pad container-lux">
        <div className="max-w-3xl">
          <SectionHeading kicker="Our Vision" title="Building the Future of Living" />
          <p className="mt-6 font-display text-2xl sm:text-3xl text-ivory leading-snug">“{c?.vision_statement}”</p>
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(c?.vision_pillars || []).map((p, i) => (
            <FadeUp key={i} delay={i * 0.05}>
              <div className="rounded-2xl bg-glass hairline p-6 h-full">
                <div className="h-9 w-9 grid place-items-center rounded-full bg-[rgba(212,175,55,0.12)] text-gold font-semibold">{i + 1}</div>
                <div className="mt-4 text-ivory font-semibold">{p.title}</div>
                <p className="mt-1.5 text-sm text-[color:var(--lux-ivory)]/60">{p.description}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      <section className="section-pad bg-[color:var(--lux-obsidian)] border-y border-[color:var(--border-hairline)]">
        <div className="container-lux">
          <SectionHeading kicker="Leadership" title="Meet Our Team" subtitle="The experienced minds steering Homeland Group's vision forward." />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((t) => (
              <FadeUp key={t.id}>
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="rounded-2xl bg-glass hairline overflow-hidden lift cursor-pointer text-left" data-testid={`team-card-${t.id}`}>
                      <div className="aspect-square overflow-hidden"><img src={t.image} alt={t.name} loading="lazy" className="h-full w-full object-cover" /></div>
                      <div className="p-5">
                        <div className="text-ivory font-semibold">{t.name}</div>
                        <div className="text-gold text-sm mt-0.5">{t.role}</div>
                        <div className="text-xs text-[color:var(--lux-ivory)]/55 mt-2">{t.expertise}</div>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="bg-[color:var(--lux-charcoal)] border-[color:var(--border-hairline)] text-ivory max-w-lg">
                    <div className="flex gap-4">
                      <img src={t.image} alt={t.name} className="h-24 w-24 rounded-xl object-cover" />
                      <div>
                        <div className="font-display text-2xl">{t.name}</div>
                        <div className="text-gold text-sm">{t.role}</div>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-[color:var(--lux-ivory)]/75 leading-relaxed">{t.bio}</p>
                  </DialogContent>
                </Dialog>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
