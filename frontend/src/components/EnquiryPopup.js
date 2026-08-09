import React, { useEffect, useState } from "react";
import { getProjects } from "@/lib/api";
import EnquiryModal from "@/components/EnquiryModal";

const SESSION_KEY = "homeland_enquiry_popup_shown";
export const LEAD_KEY = "homeland_lead_submitted";

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

  const markLead = () => {
    try { sessionStorage.setItem(LEAD_KEY, "1"); } catch (e) { /* ignore */ }
  };

  return (
    <EnquiryModal
      open={open}
      onClose={() => setOpen(false)}
      projects={projects}
      onSuccess={markLead}
    />
  );
};

export default EnquiryPopup;
