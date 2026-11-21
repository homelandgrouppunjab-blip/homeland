import React, { useEffect, useMemo, useRef } from "react";
import DOMPurify from "dompurify";

// Renders an admin-pasted social embed widget (e.g. Behold / SnapWidget /
// EmbedSocial / Elfsight). This is admin-only input, but we still defend in
// depth against XSS:
//   1. The markup is sanitised with DOMPurify and rendered via React's
//      dangerouslySetInnerHTML (no raw innerHTML assignment). DOMPurify strips
//      inline <script> bodies, on* event handlers and javascript: URLs.
//   2. Widgets need their loader <script src="..."> to run, so we re-create ONLY
//      external scripts whose host is on a known-provider allowlist, appended to
//      a dedicated node. Inline script bodies are never executed.
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

// Exposed so the admin UI can show the built-in default providers.
export const DEFAULT_EMBED_HOSTS = ALLOWED_SCRIPT_HOSTS;

function isAllowedScriptSrc(src, hosts) {
  if (!src) return false;
  try {
    const url = new URL(src, window.location.origin);
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    return hosts.some((h) => host === h || host.endsWith("." + h));
  } catch {
    return false;
  }
}

export default function SocialEmbed({ code, className = "", allowedHosts }) {
  const scriptHost = useRef(null);
  // Admin-managed allowlist (from site content) overrides the defaults when set.
  const hosts = Array.isArray(allowedHosts) && allowedHosts.length
    ? allowedHosts.map((h) => String(h).trim().toLowerCase()).filter(Boolean)
    : ALLOWED_SCRIPT_HOSTS;

  // Sanitised markup, rendered by React (no direct innerHTML assignment).
  const sanitized = useMemo(
    () => (code ? DOMPurify.sanitize(code, { ADD_TAGS: ["iframe"], ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "target"] }) : ""),
    [code]
  );

  // Append ONLY external, allowlisted loader scripts to a dedicated node.
  useEffect(() => {
    const host = scriptHost.current;
    if (!host) return;
    while (host.firstChild) host.removeChild(host.firstChild); // clear previous (no innerHTML)
    if (!code) return;

    // DOMParser inspects the raw markup WITHOUT executing or loading anything.
    const parsed = new DOMParser().parseFromString(code, "text/html");
    Array.from(parsed.querySelectorAll("script")).forEach((old) => {
      const src = old.getAttribute("src");
      if (!isAllowedScriptSrc(src, hosts)) return; // skip inline + non-allowlisted
      const s = document.createElement("script");
      s.src = src;
      if (old.async) s.async = true;
      if (old.defer) s.defer = true;
      const charset = old.getAttribute("charset");
      if (charset) s.setAttribute("charset", charset);
      host.appendChild(s);
    });
  }, [code, hosts.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!code) return null;
  return (
    <div className={className} data-testid="social-embed">
      <div dangerouslySetInnerHTML={{ __html: sanitized }} />
      <div ref={scriptHost} aria-hidden="true" />
    </div>
  );
}
