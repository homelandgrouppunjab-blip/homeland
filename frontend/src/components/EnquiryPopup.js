import React, { useEffect, useState } from "react";
import { X, Sparkles } from "lucide-react";
import { getProjects } from "@/lib/api";
import EnquiryForm from "@/components/EnquiryForm";

const SESSION_KEY = "homeland_enquiry_popup_shown";

export const EnquiryPopup = () => {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    let shown = false;
    try {
      shown = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch (e) {
      shown = false;
    }
    if (shown) return;

    getProjects().then(setProjects).catch(() => {});
    const t = setTimeout(() => {
      setOpen(true);
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch (e) {
        /* ignore */
      }
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Background overlay - clickable to close */}
      <div
        className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-sm"
        onMouseDown={(e) => {
          // Only close if the press starts directly on the overlay itself.
          // Using mousedown (not click) avoids stray synthetic clicks from
          // portaled Select content closing the popup.
          if (e.target === e.currentTarget) {
            setOpen(false);
          }
        }}
        data-testid="enquiry-popup-overlay"
      />
      {/* Modal card - positioned above overlay */}
      <div className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Enquiry form"
          data-testid="enquiry-popup"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="relative w-full max-w-sm max-h-[88vh] overflow-y-auto rounded-2xl bg-[color:var(--lux-charcoal)] border border-[color:var(--border-gold)] shadow-[0_24px_80px_rgba(0,0,0,0.6)] pointer-events-auto"
        >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          data-testid="enquiry-popup-close"
          className="absolute right-3 top-3 z-10 h-8 w-8 grid place-items-center rounded-full bg-black/40 text-[color:var(--lux-ivory)]/70 hover:text-gold hover:bg-black/60 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-5 pt-6 pb-5 sm:px-6">
          <div className="flex flex-col items-center text-center mb-4">
            <img src="/homeland-logo.webp" alt="Homeland Group" className="h-6 w-auto mb-3" data-testid="enquiry-popup-logo" />
            <div className="inline-flex items-center gap-1.5 text-gold text-[10px] font-semibold uppercase tracking-[0.2em]">
              <Sparkles className="h-3 w-3" /> Private Invitation
            </div>
            <h3 className="font-display text-xl sm:text-2xl text-ivory leading-tight mt-1.5">
              Discover Your Next Address
            </h3>
            <p className="mt-1.5 text-xs text-[color:var(--lux-ivory)]/60 max-w-xs">
              Register your interest and our team will share curated options &amp; priority allotment details.
            </p>
          </div>
          <EnquiryForm projects={projects} compact />
        </div>
      </div>
    </div>
    </>
  );
};

export default EnquiryPopup;
