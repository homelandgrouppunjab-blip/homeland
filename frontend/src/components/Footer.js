import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { getContent } from "@/lib/api";

export const Footer = () => {
  const [content, setContent] = useState(null);
  useEffect(() => {
    getContent().then(setContent).catch(() => {});
  }, []);

  return (
    <footer className="relative z-10 border-t border-[color:var(--border-hairline)] bg-[color:var(--lux-obsidian)]">
      <div className="container-lux py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <img src="/homeland-logo.webp" alt="Homeland Group" className="h-9 w-auto" />
            <p className="mt-4 text-sm text-[color:var(--lux-ivory)]/60 leading-relaxed">
              {content?.brand_tagline || "Crafting iconic addresses across Punjab & the Tricity."}
            </p>
            <div className="flex gap-3 mt-5">
              {[Facebook, Instagram, Linkedin, Youtube].map((Icon, i) => (
                <a key={i} href="#" aria-label="social" className="h-9 w-9 grid place-items-center rounded-full border border-[color:var(--border-hairline)] text-[color:var(--lux-ivory)]/70 hover:text-gold hover:border-[color:var(--border-gold)] transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-ivory uppercase tracking-wider mb-4">Explore</h4>
            <ul className="space-y-2.5 text-sm">
              {[["Projects", "/projects"], ["Compare", "/compare"], ["Upcoming", "/upcoming"], ["About Us", "/about"], ["Vision & Team", "/vision"]].map(([l, to]) => (
                <li key={to}><Link to={to} className="text-[color:var(--lux-ivory)]/65 hover:text-gold transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-ivory uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2.5 text-sm">
              {[["Brochure Center", "/brochures"], ["RERA & FAQ", "/rera"], ["Insights", "/insights"], ["Locations", "/locations"], ["Enquiry", "/contact"]].map(([l, to]) => (
                <li key={to}><Link to={to} className="text-[color:var(--lux-ivory)]/65 hover:text-gold transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-ivory uppercase tracking-wider mb-4">Get in Touch</h4>
            <ul className="space-y-3 text-sm text-[color:var(--lux-ivory)]/70">
              <li className="flex items-start gap-3"><Phone className="h-4 w-4 text-gold mt-0.5 shrink-0" /><a href={`tel:${content?.contact_phone}`} className="hover:text-gold">{content?.contact_phone || "+91 98155 00000"}</a></li>
              <li className="flex items-start gap-3"><Mail className="h-4 w-4 text-gold mt-0.5 shrink-0" /><a href={`mailto:${content?.contact_email}`} className="hover:text-gold break-all">{content?.contact_email || "sales@homelandgroup.org"}</a></li>
              <li className="flex items-start gap-3"><MapPin className="h-4 w-4 text-gold mt-0.5 shrink-0" /><span>{content?.contact_address || "Sector 77, Mohali, Punjab"}</span></li>
            </ul>
          </div>
        </div>

        <div className="gold-divider my-10" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[color:var(--lux-ivory)]/45">
          <p>© {new Date().getFullYear()} Homeland Group Mohali. All rights reserved.</p>
          <p>RERA-compliant developer · Punjab RERA Registered</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
