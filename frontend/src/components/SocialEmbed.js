import React, { useEffect, useRef } from "react";
import DOMPurify from "dompurify";

// Renders an admin-pasted social embed widget (e.g. Behold / SnapWidget /
// EmbedSocial / Elfsight). This is admin-only input, but we still defend in
// depth against XSS:
//   1. The pasted markup is sanitised with DOMPurify, which strips inline
//      <script> bodies, on* event handlers and javascript: URLs.
//   2. Widgets need their loader <script src="..."> to run, so we re-create ONLY
//      external scripts whose host is on a known-provider allowlist. Inline
//      script bodies are never executed.
const ALLOWED_SCRIPT_HOSTS = [
  "behold.so", "widget.behold.so",
  "snapwidget.com", "cdn.snapwidget.com",
  "embedsocial.com", "static.embedsocial.com",
  "elfsight.com", "static.elfsight.com", "apps.elfsight.com",
  "lightwidget.com", "cdn.lightwidget.com",
  "taggbox.com", "widget.taggbox.com",
  "commoninja.com", "widget.commoninja.com",
  "instagram.com", "www.instagram.com",
  "platform.twitter.com", "platform.instagram.com",
  "connect.facebook.net",
  "curator.io", "cdn.curator.io",
  "juicer.io", "assets.juicer.io",
];

function isAllowedScriptSrc(src) {
  if (!src) return false;
  try {
    const url = new URL(src, window.location.origin);
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    return ALLOWED_SCRIPT_HOSTS.some((h) => host === h || host.endsWith("." + h));
  } catch {
    return false;
  }
}

export default function SocialEmbed({ code, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!code) { el.innerHTML = ""; return; }

    // 1) Sanitised markup (DOMPurify removes scripts + dangerous attributes).
    el.innerHTML = DOMPurify.sanitize(code, { ADD_TAGS: ["iframe"], ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "target"] });

    // 2) Re-create ONLY external, allowlisted loader scripts from the raw code.
    const tmp = document.createElement("div");
    tmp.innerHTML = code;
    const scripts = Array.from(tmp.querySelectorAll("script"));
    scripts.forEach((old) => {
      const src = old.getAttribute("src");
      if (!isAllowedScriptSrc(src)) return; // skip inline + non-allowlisted scripts
      const s = document.createElement("script");
      s.src = src;
      if (old.async) s.async = true;
      if (old.defer) s.defer = true;
      const charset = old.getAttribute("charset");
      if (charset) s.setAttribute("charset", charset);
      el.appendChild(s);
    });
  }, [code]);

  if (!code) return null;
  return <div ref={ref} className={className} data-testid="social-embed" />;
}
