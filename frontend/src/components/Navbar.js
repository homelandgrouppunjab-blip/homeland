import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Facebook, Instagram, Linkedin, Youtube, ChevronDown } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getContent } from "@/lib/api";
import ThemeToggle from "@/components/ThemeToggle";
import Logo from "@/components/Logo";

const LINKS = [
  { label: "Home", to: "/" },
  { label: "Projects", to: "/projects" },
  { label: "Compare", to: "/compare" },
  { label: "About", to: "/about" },
  { label: "Locations", to: "/locations" },
  { label: "Insights", to: "/updates" },
];

const SOCIAL_ICONS = [
  { key: "instagram", Icon: Instagram, label: "Instagram" },
  { key: "facebook", Icon: Facebook, label: "Facebook" },
  { key: "linkedin", Icon: Linkedin, label: "LinkedIn" },
  { key: "youtube", Icon: Youtube, label: "YouTube" },
];

const LEGAL_LINKS = [
  { label: "Terms & Conditions", to: "/legal/terms" },
  { label: "Privacy Policy", to: "/legal/privacy" },
  { label: "Payment, Cancellation & Refund", to: "/legal/refund" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [social, setSocial] = useState({});
  const [siteLogo, setSiteLogo] = useState("");
  const [siteLogoLight, setSiteLogoLight] = useState("");
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    getContent().then((c) => { setSocial(c?.social || {}); setSiteLogo(c?.site_logo || ""); setSiteLogoLight(c?.site_logo_light || ""); }).catch(() => {});
  }, []);

  const socialLinks = SOCIAL_ICONS.filter((s) => social[s.key]);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled ? "bg-[color:var(--surface-glass-strong)] backdrop-blur-xl border-[color:var(--border-hairline)]" : "bg-transparent border-transparent"
      }`}
    >
      <div className="container-lux flex h-20 items-center justify-between">
        <Link to="/" data-testid="nav-logo" className="flex items-center">
          <Logo dark={siteLogo} light={siteLogoLight} className="h-[19px] sm:h-[22px] w-auto" />
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
          <div className="relative group" data-testid="nav-legal-dropdown">
            <button
              className="rounded-lg px-3 py-2 text-sm text-[color:var(--lux-ivory)]/80 hover:text-ivory hover:bg-white/5 transition-colors inline-flex items-center gap-1"
              aria-haspopup="true"
            >
              Legal <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity absolute right-0 top-full pt-2 w-64 z-50">
              <div className="rounded-xl bg-[color:var(--lux-charcoal)] border border-[color:var(--border-hairline)] shadow-[0_18px_60px_rgba(0,0,0,0.5)] p-1.5">
                {LEGAL_LINKS.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    data-testid={`nav-legal-${l.to.split("/").pop()}`}
                    className="block rounded-lg px-3 py-2 text-sm text-[color:var(--lux-ivory)]/80 hover:text-gold hover:bg-white/5 transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-1.5 pr-2 mr-1 border-r border-[color:var(--border-hairline)]">
              {socialLinks.map(({ key, Icon, label }) => (
                <a
                  key={key}
                  href={social[key]}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  data-testid={`nav-social-${key}`}
                  className="h-9 w-9 grid place-items-center rounded-full border border-[color:var(--border-hairline)] text-[color:var(--lux-ivory)]/70 hover:text-gold hover:border-[color:var(--border-gold)] transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
          <ThemeToggle />
          <Link
            to="/contact"
            data-testid="nav-enquire-button"
            className="rounded-xl border gold-line bg-[rgba(212,175,55,0.08)] px-5 py-2.5 text-sm font-semibold tracking-wide text-gold hover:bg-[rgba(212,175,55,0.16)] transition-colors"
          >
            Enquire Now
          </Link>
        </div>

        <div className="lg:hidden flex items-center gap-2">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button data-testid="mobile-nav-open-button" aria-label="Open menu" className="p-2 text-ivory">
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-[color:var(--lux-charcoal)] border-l border-[color:var(--border-hairline)] text-ivory">
              <div className="flex flex-col gap-1 mt-8">
                <Logo dark={siteLogo} light={siteLogoLight} className="h-8 w-auto mb-6" />
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
                <div className="mt-4 pt-4 border-t border-[color:var(--border-hairline)]">
                  <div className="px-3 pb-1 text-[11px] uppercase tracking-wider text-[color:var(--lux-ivory)]/40">Legal</div>
                  {LEGAL_LINKS.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={() => setOpen(false)}
                      data-testid={`mobile-nav-legal-${l.to.split("/").pop()}`}
                      className="block rounded-lg px-3 py-2.5 text-sm text-[color:var(--lux-ivory)]/75 hover:bg-white/5"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
                {socialLinks.length > 0 && (
                  <div className="flex items-center gap-2 mt-5 pt-4 border-t border-[color:var(--border-hairline)]">
                    {socialLinks.map(({ key, Icon, label }) => (
                      <a
                        key={key}
                        href={social[key]}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={label}
                        data-testid={`mobile-nav-social-${key}`}
                        className="h-10 w-10 grid place-items-center rounded-full border border-[color:var(--border-hairline)] text-[color:var(--lux-ivory)]/70 hover:text-gold hover:border-[color:var(--border-gold)] transition-colors"
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                )}
                <Link
                  to="/contact"
                  onClick={() => setOpen(false)}
                  data-testid="mobile-nav-enquire-button"
                  className="mt-4 rounded-xl border gold-line bg-[rgba(212,175,55,0.08)] px-5 py-3 text-center text-sm font-semibold text-gold"
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
