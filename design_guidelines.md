{
  "brand": {
    "name": "Homeland Group Mohali",
    "attributes": [
      "elite-class",
      "trustworthy",
      "editorial",
      "minimalist",
      "high-contrast",
      "quietly-opulent (gold used sparingly)",
      "corporate-luxury"
    ],
    "design_north_star": "A cinematic, editorial real-estate portfolio: deep black surfaces with subtle gold texture + platinum hairlines, large serif headlines, generous negative space, and glassy overlays used only for navigation/search/lead capture."
  },

  "palette_and_tokens": {
    "notes": [
      "Theme MUST be premium BLACK + GOLD with a mixed black-and-gold TEXTURE feel, plus PLATINUM accents.",
      "Gold is an accent, not a fill. Use it for: key CTAs, active states, hairline dividers, badges, and small highlights.",
      "Avoid gradients except subtle background atmospheres (<=20% viewport). No saturated purple/pink gradients.",
      "Prefer solid blacks + noise/texture overlays to create depth."
    ],

    "css_custom_properties": {
      "how_to_apply": "Replace the default shadcn tokens in /app/frontend/src/index.css :root and .dark with the values below. Keep HSL format for shadcn compatibility.",
      "root_dark_first": {
        "--background": "0 0% 4%",
        "--foreground": "40 20% 96%",

        "--card": "0 0% 7%",
        "--card-foreground": "40 20% 96%",

        "--popover": "0 0% 6%",
        "--popover-foreground": "40 20% 96%",

        "--primary": "43 74% 52%",
        "--primary-foreground": "0 0% 6%",

        "--secondary": "0 0% 12%",
        "--secondary-foreground": "40 20% 96%",

        "--muted": "0 0% 12%",
        "--muted-foreground": "40 8% 72%",

        "--accent": "0 0% 12%",
        "--accent-foreground": "40 20% 96%",

        "--destructive": "0 72% 52%",
        "--destructive-foreground": "0 0% 98%",

        "--border": "0 0% 18%",
        "--input": "0 0% 18%",
        "--ring": "43 74% 52%",

        "--chart-1": "43 74% 52%",
        "--chart-2": "210 18% 70%",
        "--chart-3": "0 0% 85%",
        "--chart-4": "0 0% 35%",
        "--chart-5": "28 55% 55%",

        "--radius": "0.75rem",

        "--lux-black": "#0A0A0A",
        "--lux-obsidian": "#0F1012",
        "--lux-charcoal": "#15171A",
        "--lux-graphite": "#1E2126",

        "--lux-gold": "#D4AF37",
        "--lux-gold-muted": "#C9A227",
        "--lux-gold-ink": "#8A6B12",

        "--lux-platinum": "#E5E4E2",
        "--lux-ivory": "#F7F3EE",

        "--lux-success": "#2E7D5B",
        "--lux-warning": "#B8892B",
        "--lux-info": "#6E8AA6",

        "--shadow-soft": "0 10px 30px rgba(0,0,0,0.35)",
        "--shadow-glass": "0 12px 40px rgba(0,0,0,0.45)",
        "--shadow-hairline": "0 0 0 1px rgba(229,228,226,0.10)",

        "--surface-glass": "rgba(21,23,26,0.55)",
        "--surface-glass-strong": "rgba(21,23,26,0.72)",
        "--border-hairline": "rgba(229,228,226,0.14)",
        "--border-gold": "rgba(212,175,55,0.35)",

        "--focus-ring": "0 0 0 3px rgba(212,175,55,0.35)",

        "--noise-opacity": "0.06",
        "--noise-size": "180px"
      }
    },

    "texture_and_background": {
      "goal": "Black + gold texture feel without heavy gradients. Use subtle noise + faint gold bloom in hero only.",
      "css_scaffold": {
        "global_noise_overlay": "Add to index.css (or a global layout wrapper) as a fixed pseudo-element. Keep opacity <= 0.08.",
        "code": "body{background:var(--lux-black);}\nbody::before{content:\"\";position:fixed;inset:0;pointer-events:none;opacity:var(--noise-opacity);background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\");background-size:var(--noise-size) var(--noise-size);mix-blend-mode:overlay;}\n\n/* optional: hero-only gold bloom (<=20% viewport) */\n.hero-atmosphere{background:radial-gradient(900px circle at 20% 10%, rgba(212,175,55,0.14), transparent 55%), radial-gradient(700px circle at 80% 0%, rgba(229,228,226,0.10), transparent 60%);}" 
      },
      "gradient_restriction_enforcement": {
        "rule": "NEVER let gradients cover more than 20% of the viewport. If it does, replace with solid black + noise overlay.",
        "allowed": [
          "Hero background atmosphere only",
          "Large section background accents only",
          "Decorative overlays"
        ],
        "prohibited": [
          "Text-heavy reading areas",
          "Small UI elements (<100px)",
          "Stacked gradients"
        ]
      }
    }
  },

  "typography": {
    "font_pairing": {
      "headlines_serif": {
        "google_font": "Gloock",
        "fallback": "ui-serif, Georgia, serif",
        "usage": "H1/H2, project names, section titles, hero tagline"
      },
      "body_sans": {
        "google_font": "Manrope",
        "fallback": "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        "usage": "Body, UI labels, forms, tables, admin dashboard"
      }
    },
    "implementation_notes_js": [
      "Add Google Fonts <link> in public/index.html (React) or import in index.css.",
      "Set body font-family to Manrope; set headings via utility class (e.g., .font-display) mapped to Gloock.",
      "Avoid overly tight tracking on serif; use tracking-[-0.01em] max."
    ],
    "type_scale_tailwind": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl font-display leading-[1.05]",
      "h2": "text-base md:text-lg font-medium text-[color:var(--lux-ivory)]/90",
      "section_title": "text-2xl sm:text-3xl font-display",
      "card_title": "text-lg sm:text-xl font-display",
      "body": "text-sm sm:text-base font-sans text-[color:var(--lux-ivory)]/85 leading-relaxed",
      "small": "text-xs sm:text-sm text-[color:var(--lux-ivory)]/70"
    },
    "numerals": {
      "recommendation": "Use tabular numbers for price ranges, possession timelines, KPIs.",
      "tailwind": "tabular-nums"
    }
  },

  "layout_and_grid": {
    "global": {
      "container": "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
      "section_spacing": "py-14 sm:py-18 lg:py-24",
      "vertical_rhythm": "Use 2–3x more spacing than default. Prefer 24/32/48/64px steps.",
      "reading_width": "For long-form content (About/History/Vision), constrain to max-w-3xl."
    },
    "homepage_skeleton": [
      "1) Sticky glass nav (logo left, Projects/About/Locations/RERA/Brochures, CTA: Enquire)",
      "2) Full-width hero cinematic slider (projects) with 3 CTAs",
      "3) Featured projects (2-up) with premium cards + badges",
      "4) Portfolio grid with filters + search",
      "5) Benchmark KPIs strip (platinum hairlines)",
      "6) Timeline milestones (History)",
      "7) Locations map preview + pins",
      "8) Leadership preview",
      "9) Lead capture section (glass panel) + footer"
    ],
    "admin_layout": {
      "pattern": "Left sidebar + top bar + content area",
      "sidebar": "w-64 hidden lg:block; collapsible on mobile via Sheet",
      "content": "bg-[color:var(--lux-black)] with card surfaces for tables/forms"
    }
  },

  "components": {
    "component_path": {
      "shadcn_primary": "/app/frontend/src/components/ui/",
      "use_these": {
        "buttons": "button.jsx",
        "cards": "card.jsx",
        "badges": "badge.jsx",
        "tabs": "tabs.jsx",
        "accordion": "accordion.jsx",
        "dialog_modal": "dialog.jsx",
        "alert_dialog": "alert-dialog.jsx",
        "carousel_slider": "carousel.jsx",
        "table_compare": "table.jsx",
        "select": "select.jsx",
        "popover": "popover.jsx",
        "sheet_drawer": "sheet.jsx",
        "tooltip": "tooltip.jsx",
        "pagination": "pagination.jsx",
        "breadcrumb": "breadcrumb.jsx",
        "form": "form.jsx",
        "input": "input.jsx",
        "textarea": "textarea.jsx",
        "calendar": "calendar.jsx",
        "sonner_toasts": "sonner.jsx"
      }
    },

    "component_styling_rules": {
      "buttons": {
        "primary": {
          "look": "Gold outline + subtle gold glow on hover; black fill only on active/pressed.",
          "tailwind": "rounded-xl px-5 py-3 text-sm font-semibold tracking-wide bg-transparent border border-[color:var(--border-gold)] text-[color:var(--lux-gold)] shadow-[var(--shadow-hairline)] hover:bg-[rgba(212,175,55,0.08)] hover:border-[rgba(212,175,55,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(212,175,55,0.35)] active:scale-[0.98]",
          "data_testid_examples": [
            "hero-download-brochure-button",
            "hero-schedule-visit-button",
            "project-detail-enquire-button"
          ]
        },
        "secondary": {
          "look": "Platinum hairline + glass surface.",
          "tailwind": "rounded-xl px-5 py-3 text-sm font-semibold bg-[color:var(--surface-glass)] backdrop-blur-md border border-[color:var(--border-hairline)] text-[color:var(--lux-ivory)] hover:bg-[color:var(--surface-glass-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(229,228,226,0.25)] active:scale-[0.98]"
        },
        "ghost": {
          "look": "Text-only with gold underline on hover.",
          "tailwind": "rounded-lg px-3 py-2 text-sm text-[color:var(--lux-ivory)]/80 hover:text-[color:var(--lux-ivory)] hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(212,175,55,0.25)]"
        }
      },

      "cards": {
        "portfolio_card": {
          "look": "Dark glass card with platinum hairline border; gold accent only for badges/active.",
          "tailwind": "rounded-2xl bg-[color:var(--surface-glass)] backdrop-blur-md border border-[color:var(--border-hairline)] shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-glass)] transition-shadow",
          "avoid": "Do not use transition-all. Only transition-shadow/opacity/background-color."
        }
      },

      "badges": {
        "status": {
          "delivered": "bg-white/6 text-[color:var(--lux-platinum)] border border-white/10",
          "ongoing": "bg-[rgba(212,175,55,0.10)] text-[color:var(--lux-gold)] border border-[rgba(212,175,55,0.25)]",
          "upcoming": "bg-[rgba(110,138,166,0.12)] text-[color:var(--lux-platinum)] border border-[rgba(110,138,166,0.25)]"
        },
        "featured_hot": {
          "featured": "bg-[rgba(229,228,226,0.10)] text-[color:var(--lux-platinum)] border border-[rgba(229,228,226,0.22)]",
          "hot_selling": "bg-[rgba(212,175,55,0.12)] text-[color:var(--lux-gold)] border border-[rgba(212,175,55,0.30)]"
        }
      },

      "filters_chips": {
        "pattern": "Use ToggleGroup for chips; active chip gets gold border + subtle fill.",
        "component": "toggle-group.jsx",
        "tailwind_active": "data-[state=on]:border-[rgba(212,175,55,0.55)] data-[state=on]:bg-[rgba(212,175,55,0.10)] data-[state=on]:text-[color:var(--lux-gold)]"
      },

      "tables_compare": {
        "pattern": "Sticky first column on desktop; zebra rows with subtle opacity; sortable headers.",
        "component": "table.jsx",
        "tailwind": "rounded-2xl overflow-hidden border border-[color:var(--border-hairline)] bg-[color:var(--surface-glass)]"
      },

      "modals_lightbox": {
        "pattern": "Use Dialog for gallery lightbox; include keyboard navigation and close button.",
        "component": "dialog.jsx",
        "overlay": "bg-black/70 backdrop-blur-sm",
        "content": "rounded-2xl bg-[color:var(--lux-charcoal)] border border-[color:var(--border-hairline)] shadow-[var(--shadow-glass)]"
      },

      "navigation": {
        "top_nav": {
          "pattern": "Sticky glass nav with NavigationMenu; mobile uses Sheet.",
          "components": ["navigation-menu.jsx", "sheet.jsx"],
          "tailwind": "sticky top-0 z-50 bg-[color:var(--surface-glass)] backdrop-blur-xl border-b border-[color:var(--border-hairline)]"
        },
        "breadcrumbs": {
          "component": "breadcrumb.jsx",
          "tailwind": "text-xs text-[color:var(--lux-ivory)]/60"
        }
      },

      "forms": {
        "pattern": "Use shadcn Form + Input/Select/Textarea. Labels in platinum, helper text muted.",
        "components": ["form.jsx", "input.jsx", "select.jsx", "textarea.jsx"],
        "focus": "focus-visible:ring-2 focus-visible:ring-[rgba(212,175,55,0.35)] focus-visible:ring-offset-0",
        "data_testid_examples": [
          "enquiry-form-name-input",
          "enquiry-form-phone-input",
          "enquiry-form-project-select",
          "enquiry-form-submit-button",
          "admin-login-submit-button"
        ]
      },

      "carousel_hero": {
        "pattern": "Use Carousel for hero slider; crossfade feel via opacity transitions on slide content; keep controls minimal.",
        "component": "carousel.jsx",
        "controls": "Use ghost buttons with platinum icons; show progress dots as hairline pills.",
        "image_treatment": "Use AspectRatio + overlay gradient (black -> transparent) for legibility; do not exceed 20% viewport gradient area (overlay counts)."
      },

      "timeline": {
        "pattern": "Milestones as vertical line with gold nodes; use Accordion for details.",
        "components": ["accordion.jsx", "separator.jsx"],
        "tailwind": "relative pl-6 before:absolute before:left-2 before:top-0 before:bottom-0 before:w-px before:bg-white/10"
      },

      "kpi_strip": {
        "pattern": "4-up KPI cards with tabular numbers; platinum hairlines; subtle hover lift.",
        "components": ["card.jsx"],
        "tailwind": "grid grid-cols-2 lg:grid-cols-4 gap-4"
      },

      "toasts": {
        "library": "sonner",
        "component": "sonner.jsx",
        "usage": "Use for enquiry success, brochure download started, admin CRUD saved."
      }
    }
  },

  "pages_and_key_ui_patterns": {
    "projects_listing": {
      "must_have": [
        "Search (Command or Input)",
        "Filters (status chips, type chips, location select)",
        "Sort (price, possession, status)",
        "Portfolio grid cards",
        "Quick actions: Explore, Download brochure"
      ],
      "layout": "Filters in a glass toolbar (sticky on desktop), grid below."
    },
    "project_detail": {
      "must_have": [
        "Media slider + lightbox gallery",
        "Brochure download",
        "Prominent RERA number block",
        "Amenities (icon grid)",
        "Stats (area, units, possession)",
        "Leaflet map with landmarks",
        "Sticky enquiry CTA on mobile"
      ],
      "rera_block": "Use Card with gold hairline border and tabular-nums; include copy button with Tooltip."
    },
    "compare_view": {
      "must_have": [
        "Table with sticky headers",
        "Project selection chips",
        "Sort + highlight differences",
        "Export/print (optional)"
      ]
    },
    "brochure_center": {
      "must_have": [
        "Search",
        "Filters",
        "Download buttons",
        "Empty state with Skeleton"
      ]
    },
    "rera_index": {
      "must_have": [
        "Certificate list",
        "RERA numbers",
        "Download/view",
        "FAQ accordion"
      ]
    },
    "locations_map": {
      "must_have": [
        "Leaflet map",
        "Pins",
        "Hover quick-cards",
        "List/map toggle on mobile"
      ]
    },
    "admin_dashboard": {
      "must_have": [
        "Login",
        "Overview KPIs",
        "Projects CRUD (table + drawer form)",
        "Content editor",
        "Team editor",
        "RERA editor",
        "Leads inbox"
      ],
      "pattern": "Use Table + Dialog/Drawer for create/edit; use Tabs for sections; use Sonner for save confirmations."
    }
  },

  "motion_and_microinteractions": {
    "principles": [
      "Motion should feel like luxury: slow, damped, minimal.",
      "Use opacity/blur/translateY micro-entrances; avoid bouncy easing.",
      "Never use transition: all."
    ],
    "recommended_library": {
      "name": "framer-motion",
      "why": "Hero slide text entrances, card hover lift, section reveal on scroll.",
      "install": "npm i framer-motion",
      "usage_js_scaffold": "import { motion } from 'framer-motion';\n\nexport default function FadeUp({ children }) {\n  return (\n    <motion.div\n      initial={{ opacity: 0, y: 10 }}\n      whileInView={{ opacity: 1, y: 0 }}\n      viewport={{ once: true, margin: '-80px' }}\n      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}\n    >\n      {children}\n    </motion.div>\n  );\n}"
    },
    "hover_states": {
      "cards": "hover:shadow-[var(--shadow-glass)] hover:-translate-y-0.5 transition-shadow (and transition-transform only if needed)",
      "buttons": "hover background tint + border brighten; active scale 0.98",
      "links": "underline appears via background-size animation (no layout shift)"
    },
    "scroll_effects": {
      "parallax": "Use subtle parallax only on hero imagery (translateY 12–24px max). Keep performance: requestAnimationFrame + prefers-reduced-motion guard."
    },
    "reduced_motion": "Respect prefers-reduced-motion: disable parallax and entrance animations."
  },

  "maps_and_data_viz": {
    "leaflet": {
      "notes": [
        "Use Leaflet/OpenStreetMap (no Google key).",
        "Pins should be custom: platinum outline with gold core dot.",
        "Map container must have rounded-2xl and hairline border."
      ],
      "tailwind_container": "rounded-2xl overflow-hidden border border-[color:var(--border-hairline)] shadow-[var(--shadow-soft)]"
    },
    "charts_admin": {
      "library": "recharts",
      "install": "npm i recharts",
      "style": "Use platinum gridlines at low opacity; gold for primary series; avoid neon colors.",
      "empty_state": "Use Skeleton + muted text."
    }
  },

  "accessibility_and_seo": {
    "wcag": {
      "requirements": [
        "WCAG AA contrast: ivory/platinum text on black surfaces; gold used for accents only.",
        "Visible focus states: gold ring on dark backgrounds.",
        "Keyboard navigation for nav menus, dialogs, carousels, compare table.",
        "All icons must have aria-hidden or accessible labels."
      ]
    },
    "aria": {
      "examples": [
        "Carousel controls: aria-label=\"Next project\"",
        "Brochure download: aria-label=\"Download brochure for Homeland Regalia\"",
        "Map: aria-label=\"Project location map\""
      ]
    },
    "seo": {
      "notes": [
        "Use semantic headings (one H1 per page).",
        "Add JSON-LD for Organization + RealEstateAgent/LocalBusiness + Product/Offer for projects.",
        "Use responsive images + lazy loading; provide alt text describing property."
      ]
    }
  },

  "testing_attributes": {
    "rule": "All interactive and key informational elements MUST include data-testid (kebab-case).",
    "coverage_examples": {
      "nav": [
        "top-nav-projects-link",
        "top-nav-enquire-button",
        "mobile-nav-open-button"
      ],
      "projects": [
        "projects-search-input",
        "projects-status-filter-toggle",
        "project-card-explore-button",
        "project-card-brochure-button",
        "project-card-rera-number"
      ],
      "compare": [
        "compare-add-project-button",
        "compare-table",
        "compare-sort-price-button"
      ],
      "admin": [
        "admin-sidebar-projects-link",
        "admin-projects-create-button",
        "admin-projects-save-button",
        "admin-leads-table"
      ]
    }
  },

  "image_urls": {
    "hero_slider_projects": [
      {
        "url": "https://images.unsplash.com/photo-1597265543804-cbc10d077285?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MDV8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjBtb2Rlcm4lMjBhcGFydG1lbnQlMjBleHRlcmlvciUyMG5pZ2h0fGVufDB8fHxibGFja3wxNzg2Mjg2NjI4fDA&ixlib=rb-4.1.0&q=85",
        "category": "hero",
        "description": "Cinematic night exterior for hero slide background (use dark overlay for legibility)."
      },
      {
        "url": "https://images.unsplash.com/photo-1597265543734-f19604aae65b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MDV8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBtb2Rlcm4lMjBhcGFydG1lbnQlMjBleHRlcmlvciUyMG5pZ2h0fGVufDB8fHxibGFja3wxNzg2Mjg2NjI4fDA&ixlib=rb-4.1.0&q=85",
        "category": "hero",
        "description": "Alternate hero slide background with architectural lines and warm highlights."
      },
      {
        "url": "https://images.unsplash.com/photo-1712849848587-f7428f18337a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MDV8MHwxfHNlYXJjaHw0fHxsdXh1cnklMjBtb2Rlcm4lMjBhcGFydG1lbnQlMjBleHRlcmlvciUyMG5pZ2h0fGVufDB8fHxibGFja3wxNzg2Mjg2NjI4fDA&ixlib=rb-4.1.0&q=85",
        "category": "hero",
        "description": "Neon-tinted skyline shot for an upcoming/commercial project slide (keep overlay strong)."
      },
      {
        "url": "https://images.unsplash.com/photo-1637423461386-15816977faa6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MDV8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBtb2Rlcm4lMjBhcGFydG1lbnQlMjBleHRlcmlvciUyMG5pZ2h0fGVufDB8fHxibGFja3wxNzg2Mjg2NjI4fDA&ixlib=rb-4.1.0&q=85",
        "category": "hero",
        "description": "Moody architectural detail for a minimal hero slide or section divider image."
      }
    ],
    "fallbacks": [
      {
        "url": "https://images.unsplash.com/photo-1597265543804-cbc10d077285?auto=format&fit=crop&w=1600&q=80",
        "category": "responsive",
        "description": "Use as responsive srcset base; generate multiple widths."
      }
    ],
    "note": "Interior/lobby images search failed via provider in this environment; main agent should add 4–6 interior shots later (living room, lobby, amenities) from Unsplash/Pexels manually if needed."
  },

  "instructions_to_main_agent": {
    "global_setup": [
      "Remove default CRA App.css centering patterns; do NOT center align the app container.",
      "Update /app/frontend/src/index.css tokens to the luxury dark-first palette above.",
      "Add global noise overlay and optional hero atmosphere class.",
      "Add Google Fonts: Gloock (headlines) + Manrope (body).",
      "Ensure every interactive element and key info has data-testid (kebab-case)."
    ],
    "public_site_build_order": [
      "1) Build Layout: sticky glass nav + footer",
      "2) Home: hero carousel + featured projects + portfolio grid + KPI strip + timeline + map preview + lead capture",
      "3) Projects listing with filters/search/sort",
      "4) Project detail with gallery lightbox + brochure + RERA + map",
      "5) Compare view table",
      "6) Brochure center + RERA index + FAQ",
      "7) Enquiry form + success toast",
      "8) Admin: login + dashboard + CRUD flows"
    ],
    "performance": [
      "Use responsive images (srcset) and lazy loading.",
      "Avoid heavy video autoplay; if used, provide poster + reduced-motion fallback.",
      "Keep glass blur limited to nav/overlays to avoid GPU overuse."
    ]
  }
}

<General UI UX Design Guidelines>  
    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms
    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text
   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json

 **GRADIENT RESTRICTION RULE**
NEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc
NEVER use dark gradients for logo, testimonial, footer etc
NEVER let gradients cover more than 20% of the viewport.
NEVER apply gradients to text-heavy content or reading areas.
NEVER use gradients on small UI elements (<100px width).
NEVER stack multiple gradient layers in the same viewport.

**ENFORCEMENT RULE:**
    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors

**How and where to use:**
   • Section backgrounds (not content backgrounds)
   • Hero section header content. Eg: dark to light to dark color
   • Decorative overlays and accent elements only
   • Hero section with 2-3 mild color
   • Gradients creation can be done for any angle say horizontal, vertical or diagonal

- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**

</Font Guidelines>

- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. 
   
- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.

- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.
   
- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly
    Eg: - if it implies playful/energetic, choose a colorful scheme
           - if it implies monochrome/minimal, choose a black–white/neutral scheme

**Component Reuse:**
	- Prioritize using pre-existing components from src/components/ui when applicable
	- Create new components that match the style and conventions of existing components when needed
	- Examine existing components to understand the project's component patterns before creating new ones

**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component

**Best Practices:**
	- Use Shadcn/UI as the primary component library for consistency and accessibility
	- Import path: ./components/[component-name]

**Export Conventions:**
	- Components MUST use named exports (export const ComponentName = ...)
	- Pages MUST use default exports (export default function PageName() {...})

**Toasts:**
  - Use `sonner` for toasts"
  - Sonner component are located in `/app/src/components/ui/sonner.tsx`

Use 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.
</General UI UX Design Guidelines>
