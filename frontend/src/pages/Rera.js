import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ExternalLink } from "lucide-react";
import { getRera, getFaqs } from "@/lib/api";
import SectionHeading from "@/components/SectionHeading";
import FadeUp from "@/components/FadeUp";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export default function Rera() {
  const [rera, setRera] = useState([]);
  const [faqs, setFaqs] = useState([]);
  useEffect(() => {
    getRera().then(setRera).catch(() => {});
    getFaqs().then(setFaqs).catch(() => {});
  }, []);

  return (
    <div className="pt-14 pb-24">
      <div className="container-lux">
        <SectionHeading kicker="Transparency" title="RERA & FAQ" subtitle="Every Homeland project is RERA-registered. Find all registration numbers and answers to common questions below." />

        <div className="mt-10 rounded-2xl hairline bg-glass overflow-hidden" data-testid="rera-table">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead><tr className="border-b border-[color:var(--border-hairline)] text-left text-xs uppercase tracking-wider text-[color:var(--lux-ivory)]/60">
                <th className="p-4">Project</th><th className="p-4">Location</th><th className="p-4">Status</th><th className="p-4">RERA Number</th><th className="p-4">Registered</th>
              </tr></thead>
              <tbody>
                {rera.map((r, i) => (
                  <tr key={i} className={`border-b border-[color:var(--border-hairline)] ${i % 2 ? "bg-white/[0.02]" : ""}`}>
                    <td className="p-4"><Link to={`/projects/${r.slug}`} className="text-ivory hover:text-gold font-medium">{r.project}</Link></td>
                    <td className="p-4 text-sm text-[color:var(--lux-ivory)]/70">{r.location}</td>
                    <td className="p-4"><span className="text-xs text-[color:var(--lux-ivory)]/70">{r.status}</span></td>
                    <td className="p-4"><span className="inline-flex items-center gap-2 text-sm text-gold tabular-nums"><ShieldCheck className="h-4 w-4" /> {(r.rera_numbers || []).join(", ")}</span></td>
                    <td className="p-4 text-sm text-[color:var(--lux-ivory)]/60 tabular-nums">{r.rera_registered_date || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-16 max-w-3xl">
          <SectionHeading kicker="Questions" title="Frequently Asked Questions" />
          <Accordion type="single" collapsible className="mt-8">
            {faqs.map((f) => (
              <AccordionItem key={f.id} value={f.id} className="border-b border-[color:var(--border-hairline)]">
                <AccordionTrigger className="text-ivory hover:text-gold text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-[color:var(--lux-ivory)]/70">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
