import React, { useEffect, useRef } from "react";

// Renders an admin-pasted social embed widget (e.g. Behold / SnapWidget /
// EmbedSocial). React strips <script> tags from dangerouslySetInnerHTML, so we
// inject the markup and then re-create any scripts so the widget initialises.
export default function SocialEmbed({ code, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = code || "";
    const scripts = Array.from(el.querySelectorAll("script"));
    scripts.forEach((old) => {
      const s = document.createElement("script");
      for (const attr of old.attributes) s.setAttribute(attr.name, attr.value);
      s.text = old.text || "";
      old.parentNode.replaceChild(s, old);
    });
  }, [code]);

  if (!code) return null;
  return <div ref={ref} className={className} data-testid="social-embed" />;
}
