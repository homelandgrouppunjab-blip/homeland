import React from "react";
import FadeUp from "@/components/FadeUp";

export const SectionHeading = ({ kicker, title, subtitle, align = "left", light = false }) => (
  <FadeUp className={align === "center" ? "text-center max-w-2xl mx-auto" : "max-w-2xl"}>
    {kicker && <div className="kicker mb-3">{kicker}</div>}
    <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.08] text-ivory">{title}</h2>
    {subtitle && (
      <p className="mt-4 text-sm sm:text-base text-[color:var(--lux-ivory)]/70 leading-relaxed">{subtitle}</p>
    )}
  </FadeUp>
);

export default SectionHeading;
