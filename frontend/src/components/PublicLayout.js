import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import WhatsAppButton from "@/components/WhatsAppButton";
import CallButton from "@/components/CallButton";
import EnquiryPopup from "@/components/EnquiryPopup";
import ExitPopup from "@/components/ExitPopup";
import Chatbot from "@/components/Chatbot";

export const PublicLayout = () => (
  <div className="relative">
    <ScrollToTop />
    <Navbar />
    <main>
      <Outlet />
    </main>
    <Footer />
    <WhatsAppButton />
    <CallButton />
    <EnquiryPopup />
    <ExitPopup />
    <Chatbot />
  </div>
);

export default PublicLayout;
