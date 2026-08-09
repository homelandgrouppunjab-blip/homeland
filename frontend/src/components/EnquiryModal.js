import React, { useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import EnquiryForm from "@/components/EnquiryForm";

// Shared presentational modal for enquiry popups (entry + exit intent).
// Backdrop is purely decorative (pointer-events-none) so the form and any
// portaled Select dropdowns work without the modal intercepting/closing.
export const EnquiryModal = ({
  open,
  onClose,
  projects = [],
  kicker = "Private Invitation",
  title = "Discover Your Next Address",
  subtitle = "Register your interest and our team will share curated options & priority allotment details.",
  dismissText = "Maybe later",
  onSuccess,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-sm pointer-events-none"
        data-testid="enquiry-popup-overlay"
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Enquiry form"
          data-testid="enquiry-popup"
          className="relative w-full max-w-sm max-h-[88vh] overflow-y-auto rounded-2xl bg-[color:var(--lux-charcoal)] border border-[color:var(--border-gold)] shadow-[0_24px_80px_rgba(0,0,0,0.6)] pointer-events-auto"
        >
          <button
            type="button"
            onClick={onClose}
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
                <Sparkles className="h-3 w-3" /> {kicker}
              </div>
              <h3 className="font-display text-xl sm:text-2xl text-ivory leading-tight mt-1.5">
                {title}
              </h3>
              <p className="mt-1.5 text-xs text-[color:var(--lux-ivory)]/60 max-w-xs">
                {subtitle}
              </p>
            </div>
            <EnquiryForm projects={projects} compact onSuccess={onSuccess} />
            <button
              type="button"
              onClick={onClose}
              data-testid="enquiry-popup-dismiss"
              className="mt-3 w-full text-center text-xs text-[color:var(--lux-ivory)]/50 hover:text-gold transition-colors"
            >
              {dismissText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EnquiryModal;
