import React, { useEffect, useState } from "react";
import { getProjects } from "@/lib/api";
import EnquiryModal from "@/components/EnquiryModal";

export const LEAD_KEY = "homeland_lead_submitted";

export const EnquiryPopup = () => {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    // Show the enquiry invite after a delay so visitors can view the page first.
    getProjects().then(setProjects).catch((e) => console.error("EnquiryPopup: failed to load projects", e));
    const t = setTimeout(() => {
      setOpen(true);
    }, 7000);
    return () => clearTimeout(t);
    // Runs once on mount; getProjects/setProjects are stable references.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markLead = () => {
    try { sessionStorage.setItem(LEAD_KEY, "1"); } catch (e) { console.warn("EnquiryPopup: could not persist LEAD_KEY", e); }
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
