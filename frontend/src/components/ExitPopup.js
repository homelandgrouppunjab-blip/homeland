import React, { useEffect, useState } from "react";
import { getProjects } from "@/lib/api";
import EnquiryModal from "@/components/EnquiryModal";
import { LEAD_KEY } from "@/components/EnquiryPopup";

const EXIT_KEY = "homeland_exit_popup_shown";

export const ExitPopup = () => {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const already = () => {
      try {
        return sessionStorage.getItem(EXIT_KEY) === "1" || sessionStorage.getItem(LEAD_KEY) === "1";
      } catch (e) {
        return false;
      }
    };
    if (already()) return;

    getProjects().then(setProjects).catch(() => {});

    const trigger = () => {
      if (already()) return;
      setOpen(true);
      try { sessionStorage.setItem(EXIT_KEY, "1"); } catch (e) { /* ignore */ }
      cleanup();
    };

    // Desktop: exit intent when cursor leaves toward the top (address bar / close)
    const onMouseOut = (e) => {
      if (e.clientY <= 0 && !e.relatedTarget) trigger();
    };
    // Mobile fallback: fast upward scroll near the top after some engagement
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (lastY - y > 60 && y < 200) trigger();
      lastY = y;
    };

    const startTimer = setTimeout(() => {
      document.addEventListener("mouseout", onMouseOut);
      window.addEventListener("scroll", onScroll, { passive: true });
    }, 8000);

    function cleanup() {
      clearTimeout(startTimer);
      document.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("scroll", onScroll);
    }

    return cleanup;
  }, []);

  return (
    <EnquiryModal
      open={open}
      onClose={() => setOpen(false)}
      projects={projects}
      kicker="Before You Go"
      title="Don't Miss Priority Allotment"
      subtitle="Leave your details and our team will send curated options, current pricing and exclusive launch access."
      dismissText="No thanks"
      onSuccess={() => { try { sessionStorage.setItem(LEAD_KEY, "1"); } catch (e) { /* ignore */ } }}
    />
  );
};

export default ExitPopup;
