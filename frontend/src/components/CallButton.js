import React, { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import { getContent } from "@/lib/api";

const DEFAULT_PHONE = "+91 90417 95879";

export const CallButton = () => {
  const [num, setNum] = useState(DEFAULT_PHONE);
  useEffect(() => {
    getContent().then((c) => { if (c?.contact_phone) setNum(c.contact_phone); }).catch(() => {});
  }, []);
  const digits = (num || "").replace(/[^0-9+]/g, "");
  const href = `tel:${digits}`;

  return (
    <a
      href={href}
      aria-label="Call Homeland Group"
      data-testid="call-float-button"
      className="fixed bottom-24 right-6 z-[60] group"
    >
      <span className="absolute inset-0 rounded-full bg-[color:var(--lux-gold)] opacity-25 animate-ping" style={{ animationDuration: "2.5s" }} />
      <span className="relative flex items-center gap-2 rounded-full bg-[color:var(--lux-obsidian)] border border-[color:var(--border-gold)] pl-3.5 pr-4 py-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.55)] transition-colors group-hover:bg-[color:var(--lux-charcoal)]">
        <Phone className="h-6 w-6 text-[color:var(--lux-gold)]" aria-hidden="true" />
        <span className="hidden sm:block text-[color:var(--lux-gold)] text-sm font-semibold pr-1">Call Now</span>
      </span>
    </a>
  );
};

export default CallButton;
