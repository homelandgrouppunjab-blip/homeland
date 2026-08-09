import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

export const PublicLayout = () => (
  <div className="relative">
    <ScrollToTop />
    <Navbar />
    <main>
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default PublicLayout;
