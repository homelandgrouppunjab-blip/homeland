import { useEffect } from "react";

// Canonical production origin. All canonical/OG URLs resolve against this so
// search engines see a single, consistent host (no www/non-www duplication).
const SITE_ORIGIN = "https://www.homelandgroupindia.com";
const DEFAULT_IMAGE = `${SITE_ORIGIN}/homeland-logo.webp`;
const SITE_NAME = "Homeland Group Mohali";

// Update (or create) a single <meta> tag in <head> IN PLACE. Updating the
// existing static tag — rather than rendering a new one — guarantees there is
// never a duplicate/conflicting description, canonical or OG tag on the page.
function setMeta(attr, key, content) {
  if (content == null || content === "") return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * SEO — route-level document metadata for a client-rendered SPA.
 *
 * Updates <title>, description, canonical and Open Graph / Twitter tags in
 * place on mount so Googlebot (which renders JS) sees accurate per-page data,
 * while the static tags in index.html remain as sensible defaults for social
 * scrapers that do not execute JavaScript. JSON-LD is injected and cleaned up
 * per route.
 */
export const Seo = ({
  title,
  description,
  path = "",
  image,
  type = "website",
  jsonLd,
  noindex = false,
}) => {
  const ldString = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    const fullTitle = title
      ? `${title} | ${SITE_NAME}`
      : `${SITE_NAME} | Elite Real Estate Developer`;
    const url = `${SITE_ORIGIN}${path || "/"}`;
    const ogImage = image || DEFAULT_IMAGE;

    document.title = fullTitle;
    setMeta("name", "description", description);
    setLink("canonical", url);
    setMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");

    setMeta("property", "og:type", type);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", ogImage);

    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", ogImage);

    let ld;
    if (ldString) {
      ld = document.createElement("script");
      ld.type = "application/ld+json";
      ld.setAttribute("data-seo-jsonld", "true");
      ld.textContent = ldString;
      document.head.appendChild(ld);
    }
    return () => {
      if (ld && ld.parentNode) ld.parentNode.removeChild(ld);
    };
  }, [title, description, path, image, type, noindex, ldString]);

  return null;
};

export { SITE_ORIGIN, SITE_NAME };
export default Seo;
