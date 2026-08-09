import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const LINKS = [
  { label: "Home", to: "/" },
  { label: "Projects", to: "/projects" },
  { label: "Compare", to: "/compare" },
  { label: "About", to: "/about" },
  { label: "Locations", to: "/locations" },
  { label: "Brochures", to: "/brochures" },
  { label: "RERA", to: "/rera" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled ? "bg-[color:var(--surface-glass-strong)] backdrop-blur-xl border-[color:var(--border-hairline)]" : "bg-transparent border-transparent"
      }`}
    >
      <div className="container-lux flex h-20 items-center justify-between">
        <Link to="/" data-testid="nav-logo" className="flex items-center">
          <img src="/homeland-logo.webp" alt="Homeland Group" className="h-8 sm:h-9 w-auto" />
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              data-testid={`nav-${l.label.toLowerCase()}-link`}
              className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                pathname === l.to ? "text-gold" : "text-[color:var(--lux-ivory)]/80 hover:text-ivory hover:bg-white/5"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link
            to="/book-visit"
            data-testid="nav-book-visit-button"
            className="rounded-xl bg-glass hairline px-4 py-2.5 text-sm font-semibold text-ivory hover:bg-[color:var(--surface-glass-strong)] transition-colors"
          >
            Book Visit
          </Link>
          <Link
            to="/contact"
            data-testid="nav-enquire-button"
            className="rounded-xl border gold-line px-5 py-2.5 text-sm font-semibold tracking-wide text-gold hover:bg-[rgba(212,175,55,0.08)] transition-colors"
          >
            Enquire Now
          </Link>
        </div>

        <div className="lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button data-testid="mobile-nav-open-button" aria-label="Open menu" className="p-2 text-ivory">
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-[color:var(--lux-charcoal)] border-l border-[color:var(--border-hairline)] text-ivory">
              <div className="flex flex-col gap-1 mt-8">
                <img src="/homeland-logo.webp" alt="Homeland Group" className="h-8 w-auto mb-6" />
                {LINKS.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    data-testid={`mobile-nav-${l.label.toLowerCase()}-link`}
                    className="rounded-lg px-3 py-3 text-base text-[color:var(--lux-ivory)]/85 hover:bg-white/5"
                  >
                    {l.label}
                  </Link>
                ))}
                <Link
                  to="/book-visit"
                  onClick={() => setOpen(false)}
                  className="mt-4 rounded-xl bg-glass hairline px-5 py-3 text-center text-sm font-semibold text-ivory"
                >
                  Book a Site Visit
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setOpen(false)}
                  className="mt-2 rounded-xl border gold-line px-5 py-3 text-center text-sm font-semibold text-gold"
                >
                  Enquire Now
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
