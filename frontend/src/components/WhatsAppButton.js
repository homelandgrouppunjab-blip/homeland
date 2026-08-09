import React, { useEffect, useState } from "react";
import { getContent } from "@/lib/api";

export const WhatsAppButton = () => {
  const [num, setNum] = useState("+91 98155 00000");
  useEffect(() => {
    getContent().then((c) => { if (c?.contact_whatsapp) setNum(c.contact_whatsapp); }).catch(() => {});
  }, []);
  const digits = (num || "").replace(/[^0-9]/g, "");
  const href = `https://wa.me/${digits}?text=${encodeURIComponent("Hi Homeland Group, I'm interested in your projects.")}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      data-testid="whatsapp-float-button"
      className="fixed bottom-6 right-6 z-[60] group"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping" style={{ animationDuration: "2.5s" }} />
      <span className="relative flex items-center gap-2 rounded-full bg-[#25D366] pl-3.5 pr-4 py-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
        <svg viewBox="0 0 32 32" className="h-6 w-6 fill-white" aria-hidden="true">
          <path d="M16.001 3.2C9.03 3.2 3.4 8.83 3.4 15.8c0 2.23.6 4.4 1.73 6.31L3.2 28.8l6.86-1.8a12.56 12.56 0 0 0 5.94 1.51h.01c6.97 0 12.6-5.63 12.6-12.6 0-3.37-1.31-6.53-3.69-8.91A12.5 12.5 0 0 0 16 3.2zm0 22.99h-.01a10.45 10.45 0 0 1-5.32-1.46l-.38-.23-3.97 1.04 1.06-3.87-.25-.4a10.42 10.42 0 0 1-1.6-5.56c0-5.79 4.71-10.5 10.5-10.5 2.8 0 5.44 1.09 7.42 3.07a10.43 10.43 0 0 1 3.07 7.43c0 5.79-4.71 10.5-10.5 10.5zm5.76-7.86c-.32-.16-1.87-.92-2.16-1.03-.29-.11-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.18.21-.37.24-.69.08-.32-.16-1.34-.49-2.55-1.57-.94-.84-1.58-1.88-1.76-2.2-.18-.32-.02-.49.14-.65.15-.14.32-.37.48-.55.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.72-.98-2.35-.26-.62-.52-.54-.71-.55l-.61-.01c-.21 0-.55.08-.84.4-.29.32-1.1 1.08-1.1 2.63 0 1.55 1.13 3.05 1.29 3.26.16.21 2.22 3.39 5.38 4.75.75.32 1.34.51 1.8.66.76.24 1.44.21 1.98.13.6-.09 1.87-.76 2.13-1.5.26-.74.26-1.37.18-1.5-.08-.13-.29-.21-.61-.37z" />
        </svg>
        <span className="hidden sm:block text-white text-sm font-semibold pr-1">WhatsApp</span>
      </span>
    </a>
  );
};

export default WhatsAppButton;
