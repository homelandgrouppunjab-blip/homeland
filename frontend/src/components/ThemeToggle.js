import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export const ThemeToggle = ({ className = "" }) => {
  const [light, setLight] = useState(
    typeof document !== "undefined" && document.documentElement.classList.contains("light")
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem("hg_theme");
      const isLight = saved === "light";
      document.documentElement.classList.toggle("light", isLight);
      setLight(isLight);
    } catch (e) { /* storage unavailable */ }
  }, []);

  const toggle = () => {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle("light", next);
    try { localStorage.setItem("hg_theme", next ? "light" : "dark"); } catch (e) { /* ignore */ }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
      data-testid="theme-toggle"
      className={`grid place-items-center h-9 w-9 rounded-full border border-[color:var(--border-hairline)] text-[color:var(--lux-ivory)]/80 hover:text-gold hover:border-[color:var(--border-gold)] transition-colors ${className}`}
    >
      {light ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  );
};

export default ThemeToggle;
