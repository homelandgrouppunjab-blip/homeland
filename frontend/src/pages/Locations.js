import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { getProjects } from "@/lib/api";
import SectionHeading from "@/components/SectionHeading";
import ProjectMap from "@/components/ProjectMap";
import StatusBadge from "@/components/StatusBadge";

export default function Locations() {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  useEffect(() => { getProjects().then(setProjects).catch(() => {}); }, []);

  return (
    <div className="pt-14 pb-24">
      <div className="container-lux">
        <SectionHeading kicker="Locations" title="Our Presence Across the Tricity" subtitle="Explore Homeland developments across Mohali, New Chandigarh, Amritsar and beyond." />
        <div className="mt-10 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ProjectMap points={projects} height="600px" zoom={9} onSelect={setSelected} />
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto no-scrollbar pr-1">
            {projects.map((p) => (
              <Link key={p.slug} to={`/projects/${p.slug}`}
                onMouseEnter={() => setSelected(p)}
                className={`block rounded-xl bg-glass hairline p-4 lift ${selected?.slug === p.slug ? "border-[color:var(--border-gold)]" : ""}`}
                data-testid={`location-item-${p.slug}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="text-ivory font-semibold text-sm">{p.name}</div>
                  <StatusBadge status={p.status} />
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-[color:var(--lux-ivory)]/60"><MapPin className="h-3.5 w-3.5 text-gold" /> {p.location}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
