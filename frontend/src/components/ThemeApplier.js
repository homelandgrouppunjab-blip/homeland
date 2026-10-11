import { useEffect } from "react";
import { getContent } from "@/lib/api";

// Map of selectable premium fonts -> full CSS stacks.
export const FONT_STACK = {
  "Playfair Display": '"Playfair Display", ui-serif, Georgia, serif',
  "Crimson Text": '"Crimson Text", ui-serif, Georgia, serif',
  "Montserrat": '"Montserrat", ui-sans-serif, system-ui, sans-serif',
  "Figtree": '"Figtree", ui-sans-serif, system-ui, sans-serif',
  "Fredoka": '"Fredoka", ui-sans-serif, system-ui, sans-serif',
  "Source Code Pro": '"Source Code Pro", ui-monospace, monospace',
  "Roboto Mono": '"Roboto Mono", ui-monospace, monospace',
};

const hexToRgba = (hex, a) => {
  if (!hex) return null;
  const m = String(hex).replace("#", "");
  const n = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const int = parseInt(n, 16);
  if (Number.isNaN(int) || n.length !== 6) return null;
  const r = (int >> 16) & 255, g = (int >> 8) & 255, b = int & 255;
  return `rgba(${r},${g},${b},${a})`;
};

const loadFonts = (families) => {
  const uniq = [...new Set(families.filter(Boolean))];
  if (!uniq.length) return;
  const spec = uniq.map((f) => `family=${f.replace(/ /g, "+")}:wght@400;500;600;700`).join("&");
  const href = `https://fonts.googleapis.com/css2?${spec}&display=swap`;
  let link = document.getElementById("hg-dynamic-fonts");
  if (!link) {
    link = document.createElement("link");
    link.id = "hg-dynamic-fonts";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  if (link.href !== href) link.href = href;
};

// Applies the admin-controlled appearance (fonts, text size, accent + background
// colours) to the live site by writing CSS custom properties on <html>.
export default function ThemeApplier() {
  useEffect(() => {
    const root = document.documentElement;
    let theme = {};

    const applyBg = () => {
      const isLight = root.classList.contains("light");
      const bg = isLight ? theme.bg_light : theme.bg_dark;
      if (bg) {
        root.style.setProperty("--lux-black", bg);
        root.style.setProperty("--lux-obsidian", bg);
      } else {
        root.style.removeProperty("--lux-black");
        root.style.removeProperty("--lux-obsidian");
      }
    };

    const apply = (t) => {
      theme = t || {};
      if (theme.font_display && FONT_STACK[theme.font_display]) root.style.setProperty("--font-display", FONT_STACK[theme.font_display]);
      if (theme.font_body && FONT_STACK[theme.font_body]) root.style.setProperty("--font-body", FONT_STACK[theme.font_body]);
      if (theme.font_scale) root.style.setProperty("--font-scale", String(theme.font_scale));
      if (theme.gold) {
        root.style.setProperty("--lux-gold", theme.gold);
        const bd = hexToRgba(theme.gold, 0.4);
        if (bd) root.style.setProperty("--border-gold", bd);
      }
      if (theme.hero_text) root.style.setProperty("--hero-text", theme.hero_text);
      loadFonts([theme.font_display, theme.font_body]);
      applyBg();
    };

    getContent().then((c) => apply(c?.theme || {})).catch(() => {});

    const obs = new MutationObserver(applyBg);
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  return null;
}
