import React, { useEffect, useState } from "react";
import { getContent } from "@/lib/api";
import { Award, Users, Building2, Clock, Ruler, ShieldCheck } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import FadeUp from "@/components/FadeUp";

const ICONS = { award: Award, users: Users, "building-2": Building2, clock: Clock, ruler: Ruler, "shield-check": ShieldCheck };

export default function Benchmark() {
  const [c, setC] = useState(null);
  useEffect(() => { getContent().then(setC).catch(() => {}); }, []);
  return (
    <div className="pt-14 pb-24">
      <div className="container-lux">
        <SectionHeading align="center" kicker="Benchmark & Performance" title="Measured by Excellence" subtitle="Our track record speaks through delivery timelines, quality standards, customer satisfaction and financial credibility." />
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(c?.benchmark_kpis || []).map((k, i) => {
            const Icon = ICONS[k.icon] || Award;
            return (
              <FadeUp key={i} delay={i * 0.05}>
                <div className="rounded-2xl bg-glass hairline p-8 h-full lift">
                  <div className="h-12 w-12 grid place-items-center rounded-full bg-[rgba(212,175,55,0.12)] text-gold"><Icon className="h-6 w-6" /></div>
                  <div className="mt-6 font-display text-5xl text-ivory tabular-nums">{k.value}</div>
                  <div className="mt-2 text-ivory font-semibold">{k.label}</div>
                  <div className="mt-1 text-sm text-[color:var(--lux-ivory)]/60">{k.description}</div>
                </div>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </div>
  );
}
