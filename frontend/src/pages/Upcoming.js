import React, { useEffect, useState } from "react";
import { getProjects } from "@/lib/api";
import ProjectCard from "@/components/ProjectCard";
import SectionHeading from "@/components/SectionHeading";
import FadeUp from "@/components/FadeUp";
import Seo from "@/components/Seo";

export default function Upcoming() {
  const [projects, setProjects] = useState([]);
  useEffect(() => { getProjects({ status: "UPCOMING" }).then(setProjects).catch(() => {}); }, []);
  return (
    <div className="pt-14 pb-24">
      <Seo
        title="Upcoming Projects"
        path="/upcoming"
        description="Register your interest for priority allotment on Homeland Group's newest landmark developments across Mohali, Amritsar, New Chandigarh, Kasauli and Goa."
      />
      <div className="container-lux">
        <SectionHeading align="center" kicker="Coming Soon" title="Upcoming Projects" subtitle="Be the first to know. Register your interest for priority allotment on our newest landmark developments." />
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((p) => <FadeUp key={p.slug}><ProjectCard project={p} /></FadeUp>)}
        </div>
        {projects.length === 0 && <div className="text-center py-20 text-[color:var(--lux-ivory)]/50">Loading upcoming projects…</div>}
      </div>
    </div>
  );
}
