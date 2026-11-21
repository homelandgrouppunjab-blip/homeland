import React, { useEffect, useState } from "react";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { getProjects, getContent } from "@/lib/api";
import SectionHeading from "@/components/SectionHeading";
import EnquiryForm from "@/components/EnquiryForm";
import ProjectMap from "@/components/ProjectMap";
import Seo from "@/components/Seo";

export default function Contact() {
  const [projects, setProjects] = useState([]);
  const [c, setC] = useState(null);
  useEffect(() => {
    getProjects().then(setProjects).catch(() => {});
    getContent().then(setC).catch(() => {});
  }, []);

  return (
    <div className="pt-14 pb-24">
      <Seo
        title="Contact Us"
        path="/contact"
        description="Get in touch with Homeland Group to book a site visit or enquire about luxury homes and commercial spaces in Mohali, Chandigarh and across Punjab. Call +91 90417 95879."
      />
      <div className="container-lux">
        <SectionHeading align="center" kicker="Get in Touch" title="Enquire With Homeland" subtitle="Whether you're buying your dream home or investing in commercial space, our team is here to help." />

        <div className="mt-14 grid lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            {[
              { icon: Phone, label: "Call Us", value: c?.contact_phone, href: `tel:${c?.contact_phone}` },
              { icon: Mail, label: "Email", value: c?.contact_email, href: `mailto:${c?.contact_email}` },
              { icon: MapPin, label: "Corporate Office", value: c?.contact_address },
              { icon: Clock, label: "Hours", value: "Mon – Sat, 10:00 AM – 7:00 PM" },
            ].map((it) => (
              <div key={it.label} className="rounded-2xl bg-glass hairline p-5 flex items-start gap-4">
                <div className="h-10 w-10 grid place-items-center rounded-full bg-[rgba(212,175,55,0.12)] text-gold shrink-0"><it.icon className="h-5 w-5" /></div>
                <div>
                  <div className="text-xs text-[color:var(--lux-ivory)]/55">{it.label}</div>
                  {it.href ? <a href={it.href} className="text-sm text-ivory hover:text-gold break-all">{it.value}</a> : <div className="text-sm text-ivory">{it.value}</div>}
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-2 rounded-2xl bg-glass hairline p-6 sm:p-8">
            <EnquiryForm projects={projects} />
          </div>
        </div>

        <div className="mt-10"><ProjectMap points={projects} height="420px" /></div>
      </div>
    </div>
  );
}
