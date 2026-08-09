import React from "react";

// Frosted-glass plaque with a blurred dark-grey outer lining, used to present
// project brand logos consistently across cards, hero slider and detail pages.
const SIZE = {
  sm: { outer: "rounded-2xl p-1.5", inner: "rounded-xl px-4 py-3", img: "h-12" },
  md: { outer: "rounded-[1.4rem] p-2", inner: "rounded-2xl px-5 py-3.5", img: "h-20 sm:h-24" },
  lg: { outer: "rounded-[1.6rem] p-2.5", inner: "rounded-2xl px-6 py-4", img: "h-24 sm:h-32 lg:h-36" },
};

export const LogoPlaque = ({ src, alt, size = "md", className = "", testId }) => {
  const s = SIZE[size] || SIZE.md;
  return (
    <div
      data-testid={testId}
      className={`inline-block ${s.outer} bg-[#2B2B2B]/50 backdrop-blur-md ring-1 ring-white/10 shadow-[0_16px_50px_rgba(0,0,0,0.5)] ${className}`}
    >
      <div className={`${s.inner} bg-[#454545]/40 backdrop-blur-xl ring-1 ring-white/10`}>
        <img src={src} alt={alt} loading="lazy" className={`${s.img} w-auto block object-contain`} />
      </div>
    </div>
  );
};

export default LogoPlaque;
