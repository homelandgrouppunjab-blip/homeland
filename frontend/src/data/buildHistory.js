// Build history / "What's New" content for homelandgroupindia.com.
// Public, user-friendly descriptions only. New entries can be prepended to
// `changelog` over time (newest first). Categories drive the on-page filter.

export const CATEGORIES = [
  { key: "projects", label: "Projects & Content" },
  { key: "images", label: "Images" },
  { key: "database", label: "Database" },
  { key: "seo", label: "SEO" },
  { key: "social", label: "Social Previews" },
  { key: "enquiries", label: "Enquiries & Chat" },
  { key: "admin", label: "Admin" },
  { key: "quality", label: "Performance & Quality" },
];

// High-level milestones shown at the top for quick reading.
export const MILESTONES = [
  {
    title: "10 projects, beautifully presented",
    desc: "Every Homeland development — from CP67 to The Edition — now has rich, hand-written descriptions, galleries and detail pages.",
  },
  {
    title: "Self-hosted project imagery",
    desc: "All official project visuals are served directly by the site, so they load fast and stay reliable.",
  },
  {
    title: "Search-ready and shareable",
    desc: "Page-level SEO, a full sitemap and rich link previews make the site easy to find and share.",
  },
  {
    title: "Smarter enquiries & live chat",
    desc: "City-aware enquiry forms, instant WhatsApp and call controls, and a helpful on-site chatbot.",
  },
];

// Full detailed, dated changelog (newest first). `stage` is an approximate
// label used where exact dates aren't tracked.
export const CHANGELOG = [
  {
    id: "quality-pass",
    category: "quality",
    date: "November 2026",
    stage: "Polish",
    title: "Performance & code-quality pass",
    desc:
      "Ran a full review of the site's code for speed and reliability. Tidied up how lists and images render, removed developer debug output from the live site, and confirmed the whole site builds cleanly with no warnings.",
  },
  {
    id: "whats-new",
    category: "admin",
    date: "November 2026",
    stage: "Polish",
    title: "\u201CWhat's New\u201D build history",
    desc:
      "Added this page so you can always see how the website has grown over time \u2014 a clear, dated record of everything that has been built, with a milestones summary and a filterable changelog.",
  },
  {
    id: "self-hosted-images",
    category: "images",
    date: "November 2026",
    stage: "Reliability",
    title: "Project images moved in-house",
    desc:
      "The ten official project renders are now stored and served by the website itself instead of relying on an external site. This makes images load faster and prevents broken pictures if an outside source ever changes.",
  },
  {
    id: "db-import",
    category: "database",
    date: "November 2026",
    stage: "Reliability",
    title: "Safe content database import",
    desc:
      "Prepared a one-click content import for the live database that refreshes all projects, posts, team and site content \u2014 while carefully leaving your enquiries and user accounts untouched. It can be re-run any time without losing data.",
  },
  {
    id: "support-email",
    category: "projects",
    date: "November 2026",
    stage: "Content",
    title: "Consistent contact details",
    desc:
      "Set a single official support email and phone number across the footer, enquiry forms and chatbot, so visitors always see the same way to reach the team.",
  },
  {
    id: "cookie-login",
    category: "admin",
    date: "November 2026",
    stage: "Security",
    title: "More secure admin sign-in",
    desc:
      "Moved the admin login to a secure, cookie-based session. Signing in to manage the site is now safer and stays signed in reliably over a secure connection.",
  },
  {
    id: "chatbot",
    category: "enquiries",
    date: "November 2026",
    stage: "Experience",
    title: "On-site chatbot & quick answers",
    desc:
      "Added a friendly chat assistant that answers common questions about projects, locations and visits in clean, easy-to-read replies, and hands over to the team with one tap to call, WhatsApp or email.",
  },
  {
    id: "enquiry-city",
    category: "enquiries",
    date: "November 2026",
    stage: "Experience",
    title: "City-aware enquiry forms",
    desc:
      "Enquiry forms now let visitors pick a city first and then see only the relevant projects. The chosen city travels through to the team and the WhatsApp message, so leads arrive with the right context.",
  },
  {
    id: "whatsapp-call",
    category: "enquiries",
    date: "November 2026",
    stage: "Experience",
    title: "One-tap WhatsApp & call",
    desc:
      "Standardised the contact number and added floating call and WhatsApp buttons that work cleanly on both desktop and mobile, with a thank-you acknowledgement and a saved lead for every enquiry.",
  },
  {
    id: "social-previews",
    category: "social",
    date: "November 2026",
    stage: "Reach",
    title: "Rich link previews",
    desc:
      "When a project or article link is shared on WhatsApp, Facebook or X, it now shows a proper title, description and image preview instead of a bare link \u2014 generated on the server so it always works.",
  },
  {
    id: "seo-engine",
    category: "seo",
    date: "November 2026",
    stage: "Reach",
    title: "Built-in SEO engine",
    desc:
      "Added per-page titles and descriptions, a single clean web address for each page, an automatic sitemap covering all projects, and structured data that helps Google understand the developer and its projects.",
  },
  {
    id: "insights",
    category: "projects",
    date: "November 2026",
    stage: "Content",
    title: "Insights & articles",
    desc:
      "Wrote and published a set of polished, easy-to-read insight articles about the projects and the region, each with its own shareable page.",
  },
  {
    id: "project-content",
    category: "projects",
    date: "November 2026",
    stage: "Content",
    title: "Hand-written project stories",
    desc:
      "Rewrote all ten project descriptions and the company history in warm, premium language \u2014 keeping every factual detail (RERA numbers, sizes, locations) exactly accurate.",
  },
  {
    id: "launch",
    category: "projects",
    date: "November 2026",
    stage: "Launch",
    title: "Website foundation",
    desc:
      "Built the full Homeland Group website \u2014 home, projects, project detail pages, about, vision, locations, brochures, RERA & FAQ, insights and contact \u2014 in a consistent dark, luxury style with gold accents.",
  },
];

export default { CATEGORIES, MILESTONES, CHANGELOG };
