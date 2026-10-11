import React, { useEffect, useState } from "react";

// Theme-aware logo. Shows the gold logo in dark mode and a crisp dark-ink
// variant in light (day) mode. Both are admin-replaceable via site content
// (site_logo for dark mode, site_logo_light for light mode).
export const Logo = ({ dark, light, alt = "Homeland Group", className = "", testid }) => {
  const [isLight, setIsLight] = useState(
    typeof document !== "undefined" && document.documentElement.classList.contains("light")
  );

  useEffect(() => {
    const el = document.documentElement;
    const update = () => setIsLight(el.classList.contains("light"));
    update();
    const obs = new MutationObserver(update);
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const src = isLight
    ? (light || "/homeland-logo-dark.webp")
    : (dark || "/homeland-logo.webp");

  return <img src={src} alt={alt} className={className} data-testid={testid} />;
};

export default Logo;
