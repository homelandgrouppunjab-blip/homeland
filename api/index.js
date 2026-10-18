// Homeland Group — REST API (Node.js + Express + native MongoDB driver)
// No Python/FastAPI. Runs as a single Node process that serves the built
// React frontend and the /api routes (Hostinger managed Node.js or VPS).
try { require("dotenv").config({ path: require("path").join(__dirname, ".env") }); } catch (e) { /* dotenv optional (host dashboard env) */ }
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const seed = require("./seed-data.json");
const { sendEmail } = require("./email");
const mysqlDb = require("./db");

const JWT_SECRET = process.env.JWT_SECRET || "change-me";
const JWT_EXPIRE_MINUTES = parseInt(process.env.JWT_EXPIRE_MINUTES || "1440", 10);
// Admin login via env (preferred). ADMIN_EMAIL kept as a fallback username.
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || process.env.ADMIN_EMAIL || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Homeland@2013";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@homelandgroup.org";
const ALLOWED_EXT = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif", ".pdf"];
const EMERGENT_LLM_KEY = process.env.EMERGENT_LLM_KEY || "";
const LLM_PROXY = (process.env.INTEGRATION_PROXY_URL || "https://integrations.emergentagent.com") + "/llm/chat/completions";

// Call the Emergent LLM gateway (OpenAI-compatible). provider: openai|anthropic|gemini.
async function callLLM(messages, { provider = "openai", model = "gpt-5.4", temperature } = {}) {
  if (!EMERGENT_LLM_KEY) throw new Error("LLM key not configured");
  const resolvedModel = provider === "gemini" ? `gemini/${model}` : model;
  const body = { model: resolvedModel, messages };
  if (temperature != null) body.temperature = temperature;
  const r = await fetch(LLM_PROXY, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${EMERGENT_LLM_KEY}` },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`LLM gateway ${r.status}: ${txt.slice(0, 200)}`);
  }
  const data = await r.json();
  return data?.choices?.[0]?.message?.content || "";
}

// ---- Site-visit reminders (email the sales team on the morning of each visit) ----
function escapeHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// Returns today's date as YYYY-MM-DD in the configured timezone (en-CA => ISO-like).
function todayInTz(tz) {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: tz || "UTC", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

// Find visits scheduled for today and email the sales team a single digest.
// Idempotent: each visit is marked reminder_sent so it is never emailed twice.
// Pass { force: true } to re-send during testing.
async function runVisitReminders({ force = false } = {}) {
  const db = await getDb();
  const tz = process.env.REMINDER_TZ || "Asia/Kolkata";
  const today = todayInTz(tz);
  const q = { visit_date: today };
  if (!force) q.reminder_sent = { $ne: true };
  const visits = await db.collection("site_visits").find(q, { projection: { _id: 0 } }).sort({ time_slot: 1 }).toArray();
  if (!visits.length) return { date: today, count: 0, sent: false };

  const recipient = process.env.REMINDER_EMAIL || ADMIN_EMAIL;
  const niceDate = (() => { try { return new Date(today).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }); } catch { return today; } })();
  const rows = visits.map((v) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;font-family:Arial,sans-serif;font-size:14px;color:#111">${escapeHtml(v.time_slot || "—")}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;font-family:Arial,sans-serif;font-size:14px;color:#111">${escapeHtml(v.name || "—")}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;font-family:Arial,sans-serif;font-size:14px;color:#111">${escapeHtml(v.phone || "—")}<br><span style="color:#666;font-size:12px">${escapeHtml(v.email || "")}</span></td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;font-family:Arial,sans-serif;font-size:14px;color:#111">${escapeHtml(v.project || "Any")}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;font-family:Arial,sans-serif;font-size:14px;color:#111">${escapeHtml(v.guests || "—")}</td>
    </tr>`).join("");
  const html = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f3;padding:24px">
      <tr><td align="center">
        <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #eee">
          <tr><td style="background:#14110c;padding:20px 24px">
            <span style="font-family:Arial,sans-serif;font-size:18px;color:#d4af37;font-weight:bold">Homeland Group</span>
            <span style="font-family:Arial,sans-serif;font-size:13px;color:#cfc7b5;float:right">Site Visit Reminders</span>
          </td></tr>
          <tr><td style="padding:24px">
            <p style="font-family:Arial,sans-serif;font-size:16px;color:#111;margin:0 0 4px">Site visits scheduled for today</p>
            <p style="font-family:Arial,sans-serif;font-size:14px;color:#666;margin:0 0 18px">${escapeHtml(niceDate)} — <strong>${visits.length}</strong> visit(s)</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:8px;overflow:hidden">
              <tr style="background:#f4f1ea">
                <th align="left" style="padding:10px 12px;font-family:Arial,sans-serif;font-size:12px;color:#555;text-transform:uppercase;letter-spacing:.5px">Time</th>
                <th align="left" style="padding:10px 12px;font-family:Arial,sans-serif;font-size:12px;color:#555;text-transform:uppercase;letter-spacing:.5px">Visitor</th>
                <th align="left" style="padding:10px 12px;font-family:Arial,sans-serif;font-size:12px;color:#555;text-transform:uppercase;letter-spacing:.5px">Contact</th>
                <th align="left" style="padding:10px 12px;font-family:Arial,sans-serif;font-size:12px;color:#555;text-transform:uppercase;letter-spacing:.5px">Project</th>
                <th align="left" style="padding:10px 12px;font-family:Arial,sans-serif;font-size:12px;color:#555;text-transform:uppercase;letter-spacing:.5px">Guests</th>
              </tr>
              ${rows}
            </table>
            <p style="font-family:Arial,sans-serif;font-size:12px;color:#999;margin:18px 0 0">Automated reminder from the Homeland Group website. We never ask for your password or card details by email.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>`;
  const subject = `Today's site visits — ${visits.length} scheduled (${today})`;
  const id = await sendEmail({ to: recipient, subject, html });
  const ids = visits.map((v) => v.id);
  await db.collection("site_visits").updateMany({ id: { $in: ids } }, { $set: { reminder_sent: true, reminder_sent_at: nowIso() } });
  return { date: today, count: visits.length, sent: true, recipient, email_id: id };
}

// ---- MySQL-backed data layer (Mongo-compatible API via ./db.js) ----
const nowIso = () => new Date().toISOString();
const uuid = () => crypto.randomUUID();
const slugify = (t) =>
  (t || "").toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/[\s_-]+/g, "-");

let _seeded = false;
async function getDb() {
  let db;
  try {
    db = await mysqlDb.getDb(); // ensures connection + tables
  } catch (e) {
    console.error("[mysql] connection FAILED:", (e && e.message) || e,
      "\n[mysql] Check: (1) MYSQL_HOST/PORT/USER/PASSWORD/DATABASE are set correctly, (2) on Hostinger the app and DB share the host so MYSQL_HOST is usually 'localhost', (3) the DB user has privileges on the database.");
    throw e;
  }
  if (!_seeded) {
    _seeded = true;
    try { await ensureSeed(db); }
    catch (e) { _seeded = false; throw e; }
  }
  return db;
}

// Seed baseline content only into empty tables (admin login is env-based, no admin table needed).
async function ensureSeed(db) {
  const seedIfEmpty = async (col, docs) => {
    if ((await db.collection(col).countDocuments({})) === 0 && (docs || []).length) {
      await db.collection(col).insertMany(docs.map((d) => ({ ...d })));
    }
  };
  await seedIfEmpty("projects", seed.projects);
  await seedIfEmpty("site_content", seed.site_content);
  await seedIfEmpty("faqs", seed.faqs);
  await seedIfEmpty("team", seed.team);
  await seedIfEmpty("posts", seed.posts);
  await seedIfEmpty("updates", seed.updates);
  await seedIfEmpty("uploads", seed.uploads);
}

// ---- Auth ----
function signToken(email) {
  return jwt.sign({ sub: email }, JWT_SECRET, { expiresIn: `${JWT_EXPIRE_MINUTES}m` });
}
function requireAdmin(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ detail: "Not authenticated" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.admin = { email: payload.sub };
    next();
  } catch (e) {
    return res.status(401).json({ detail: "Invalid or expired token" });
  }
}

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

// ---- App / Router ----
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));
const r = express.Router();

// ---- Customer auth (Emergent managed Google sign-in) ----
function parseCookies(req) {
  const h = req.headers.cookie || "";
  const o = {};
  h.split(";").forEach((p) => { const i = p.indexOf("="); if (i > -1) o[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim()); });
  return o;
}
async function currentUser(req) {
  const db = await getDb();
  const cookies = parseCookies(req);
  let token = cookies.session_token;
  const ah = req.headers.authorization || "";
  if (!token && ah.startsWith("Bearer ")) token = ah.slice(7);
  if (!token) return null;
  const s = await db.collection("user_sessions").findOne({ session_token: token });
  if (!s) return null;
  let exp = s.expires_at; if (typeof exp === "string") exp = new Date(exp);
  if (exp && exp.getTime() < Date.now()) return null;
  return await db.collection("users").findOne({ user_id: s.user_id }, { projection: { _id: 0 } });
}
async function requireUser(req, res, next) {
  try { const u = await currentUser(req); if (!u) return res.status(401).json({ detail: "Sign in required" }); req.user = u; next(); }
  catch (e) { res.status(500).json({ detail: "Auth error" }); }
}

const wrap = (fn) => (req, res) => Promise.resolve(fn(req, res)).catch((e) => {
  console.error(e);
  res.status(500).json({ detail: "Server error" });
});

// -------- Public --------
r.get("/", (req, res) => res.json({ message: "Homeland Group Mohali API", status: "ok" }));

r.get("/projects", wrap(async (req, res) => {
  const db = await getDb();
  const q = { visible: { $ne: false } };
  const { status, type, city, featured, hot_selling, search, sort = "order" } = req.query;
  if (status) q.status = status;
  if (type) q.type = type;
  if (city) q.city = city;
  if (featured !== undefined) q.featured = featured === "true";
  if (hot_selling !== undefined) q.hot_selling = hot_selling === "true";
  if (search) {
    const rx = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    q.$or = [{ name: rx }, { location: rx }, { city: rx }, { description: rx }, { type: rx }];
  }
  let docs = await db.collection("projects").find(q, { projection: { _id: 0 } }).limit(300).toArray();
  const rank = { ONGOING: 0, DELIVERED: 1, UPCOMING: 2 };
  if (sort === "status") docs.sort((a, b) => (rank[a.status] ?? 9) - (rank[b.status] ?? 9) || (a.order ?? 99) - (b.order ?? 99));
  else if (sort === "name") docs.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  else docs.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  res.json(docs);
}));

r.get("/projects/:slug", wrap(async (req, res) => {
  const db = await getDb();
  let doc = await db.collection("projects").findOne({ slug: req.params.slug }, { projection: { _id: 0 } });
  if (!doc) doc = await db.collection("projects").findOne({ id: req.params.slug }, { projection: { _id: 0 } });
  if (!doc) return res.status(404).json({ detail: "Project not found" });
  res.json(doc);
}));

r.get("/content", wrap(async (req, res) => {
  const db = await getDb();
  const doc = await db.collection("site_content").findOne({ key: "main" }, { projection: { _id: 0 } });
  if (!doc) return res.status(404).json({ detail: "Content not found" });
  res.json(doc);
}));

r.get("/team", wrap(async (req, res) => {
  const db = await getDb();
  const docs = await db.collection("team").find({}, { projection: { _id: 0 } }).toArray();
  docs.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  res.json(docs);
}));

r.get("/faqs", wrap(async (req, res) => {
  const db = await getDb();
  const docs = await db.collection("faqs").find({}, { projection: { _id: 0 } }).toArray();
  docs.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  res.json(docs);
}));

r.get("/posts", wrap(async (req, res) => {
  const db = await getDb();
  const q = { published: true };
  if (req.query.category && req.query.category !== "All") q.category = req.query.category;
  const docs = await db.collection("posts").find(q, { projection: { _id: 0 } }).toArray();
  docs.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  res.json(docs);
}));

r.get("/posts/:slug", wrap(async (req, res) => {
  const db = await getDb();
  const doc = await db.collection("posts").findOne({ slug: req.params.slug }, { projection: { _id: 0 } });
  if (!doc) return res.status(404).json({ detail: "Post not found" });
  res.json(doc);
}));

r.get("/updates", wrap(async (req, res) => {
  const db = await getDb();
  const q = { published: true };
  const docs = await db.collection("updates").find(q, { projection: { _id: 0 } }).toArray();
  docs.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (b.date || "").localeCompare(a.date || ""));
  res.json(docs);
}));

r.post("/auth/session", wrap(async (req, res) => {
  const sid = req.headers["x-session-id"] || (req.body || {}).session_id;
  if (!sid) return res.status(400).json({ detail: "Missing session id" });
  const resp = await fetch("https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data", { headers: { "X-Session-ID": sid } });
  if (!resp.ok) return res.status(401).json({ detail: "Invalid session" });
  const data = await resp.json();
  const db = await getDb();
  let user = await db.collection("users").findOne({ email: data.email }, { projection: { _id: 0 } });
  if (!user) {
    user = { user_id: `user_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`, email: data.email, name: data.name, picture: data.picture, created_at: nowIso() };
    await db.collection("users").insertOne({ ...user });
  } else {
    await db.collection("users").updateOne({ email: data.email }, { $set: { name: data.name, picture: data.picture } });
    user.name = data.name; user.picture = data.picture;
  }
  const token = data.session_token;
  await db.collection("user_sessions").insertOne({ user_id: user.user_id, session_token: token, expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), created_at: nowIso() });
  res.cookie("session_token", token, { httpOnly: true, secure: true, sameSite: "none", path: "/", maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({ user });
}));
r.get("/auth/me", wrap(async (req, res) => {
  const u = await currentUser(req);
  if (!u) return res.status(401).json({ detail: "Not authenticated" });
  res.json(u);
}));
r.post("/auth/logout", wrap(async (req, res) => {
  const t = parseCookies(req).session_token;
  if (t) { const db = await getDb(); await db.collection("user_sessions").deleteOne({ session_token: t }); }
  res.clearCookie("session_token", { path: "/", sameSite: "none", secure: true });
  res.json({ success: true });
}));

// ---- Member area: saved favourites ----
// Favourite slugs are stored as an array on the user document.
r.get("/me/favorites", requireUser, wrap(async (req, res) => {
  const db = await getDb();
  const slugs = Array.isArray(req.user.favorites) ? req.user.favorites : [];
  res.json({ slugs });
}));

// Return the full (visible) project objects for the user's favourites, ordered
// to match the public listing shape so <ProjectCard> can render them directly.
r.get("/me/favorites/projects", requireUser, wrap(async (req, res) => {
  const db = await getDb();
  const slugs = Array.isArray(req.user.favorites) ? req.user.favorites : [];
  if (!slugs.length) return res.json([]);
  const docs = await db.collection("projects")
    .find({ slug: { $in: slugs }, visible: { $ne: false } }, { projection: { _id: 0 } })
    .toArray();
  docs.sort((a, b) => slugs.indexOf(a.slug) - slugs.indexOf(b.slug));
  res.json(docs);
}));

r.post("/me/favorites", requireUser, wrap(async (req, res) => {
  const db = await getDb();
  const slug = String((req.body || {}).slug || "").trim();
  if (!slug) return res.status(400).json({ detail: "Missing project slug" });
  const exists = await db.collection("projects").findOne({ slug }, { projection: { _id: 1 } });
  if (!exists) return res.status(404).json({ detail: "Project not found" });
  await db.collection("users").updateOne({ user_id: req.user.user_id }, { $addToSet: { favorites: slug } });
  const u = await db.collection("users").findOne({ user_id: req.user.user_id }, { projection: { _id: 0, favorites: 1 } });
  res.json({ slugs: (u && u.favorites) || [] });
}));

r.delete("/me/favorites/:slug", requireUser, wrap(async (req, res) => {
  const db = await getDb();
  await db.collection("users").updateOne({ user_id: req.user.user_id }, { $pull: { favorites: req.params.slug } });
  const u = await db.collection("users").findOne({ user_id: req.user.user_id }, { projection: { _id: 0, favorites: 1 } });
  res.json({ slugs: (u && u.favorites) || [] });
}));

// ---- Member area: my enquiry history (leads + site visits) ----
r.get("/me/inquiries", requireUser, wrap(async (req, res) => {
  const db = await getDb();
  const email = (req.user.email || "").toLowerCase();
  const matchByUser = { $or: [{ user_id: req.user.user_id }] };
  if (email) matchByUser.$or.push({ email_lower: email });
  const leads = await db.collection("leads").find(matchByUser, { projection: { _id: 0 } }).sort({ created_at: -1 }).limit(200).toArray();
  const visits = await db.collection("site_visits").find(matchByUser, { projection: { _id: 0 } }).sort({ created_at: -1 }).limit(200).toArray();
  const items = [
    ...leads.map((l) => ({ ...l, kind: "enquiry" })),
    ...visits.map((v) => ({ ...v, kind: "visit" })),
  ].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  res.json(items);
}));

r.post("/chat", wrap(async (req, res) => {
  const db = await getDb();
  const b = req.body || {};
  const history = Array.isArray(b.messages) ? b.messages.slice(-12) : [];
  const content = await db.collection("site_content").findOne({ key: "main" }, { projection: { _id: 0 } });
  const projects = await db.collection("projects").find({ visible: { $ne: false } }, { projection: { _id: 0 } }).toArray();
  const projLines = projects.map((p) => `- ${p.name} (${p.status}, ${p.type}) in ${p.location || p.city || ""}; ${p.price_range || "price on request"}; config: ${(p.unit_types || []).join(", ")}`).join("\n");
  const ai = content?.ai || {};
  const sys = `You are the virtual concierge for ${content?.brand_name || "Homeland Group"}, a premium real-estate developer. Answer helpfully and concisely (2-5 sentences) about our projects, locations, pricing, amenities, and how to enquire or book a visit. If you are unsure, invite the visitor to enquire. Never invent specific prices, RERA numbers, dates, or figures that are not listed below. Contact: phone ${content?.contact_phone || "-"}, email ${content?.contact_email || "-"}, WhatsApp ${content?.contact_whatsapp || "-"}.\n\nProjects:\n${projLines || "(none listed)"}`;
  const messages = [{ role: "system", content: sys }, ...history.filter((m) => m && (m.role === "user" || m.role === "assistant") && m.content).map((m) => ({ role: m.role, content: String(m.content).slice(0, 2000) }))];
  if (!messages.some((m) => m.role === "user")) return res.status(400).json({ detail: "No user message" });
  try {
    const reply = await callLLM(messages, { provider: ai.provider || "openai", model: ai.model || "gpt-5.4" });
    res.json({ reply });
  } catch (e) {
    console.error("chat error", e.message);
    res.status(503).json({ detail: "The assistant is unavailable right now. Please try again or contact us directly." });
  }
}));

r.get("/uploads/:filename", wrap(async (req, res) => {
  const db = await getDb();
  const f = await db.collection("uploads").findOne({ filename: req.params.filename });
  if (!f) return res.status(404).json({ detail: "File not found" });
  res.setHeader("Content-Type", f.contentType || "application/octet-stream");
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.send(Buffer.from(f.data, "base64"));
}));

r.get("/rera", wrap(async (req, res) => {
  const db = await getDb();
  const docs = await db.collection("projects").find({}, { projection: { _id: 0 } }).toArray();
  const out = docs.map((d) => ({
    project: d.name, slug: d.slug, status: d.status, location: d.location,
    rera_numbers: d.rera_numbers || [], rera_registered_date: d.rera_registered_date || "",
    rera_certificate_url: d.rera_certificate_url || "",
  }));
  out.sort((a, b) => (a.project || "").localeCompare(b.project || ""));
  res.json(out);
}));

r.get("/brochures", wrap(async (req, res) => {
  const db = await getDb();
  const docs = await db.collection("projects").find({}, { projection: { _id: 0 } }).toArray();
  const out = docs.map((d) => ({
    project: d.name, slug: d.slug, status: d.status, location: d.location,
    type: d.type, hero_image: d.hero_image, brochure_url: d.brochure_url || "", order: d.order ?? 99,
  }));
  out.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  res.json(out);
}));

r.post("/leads", wrap(async (req, res) => {
  const db = await getDb();
  const b = req.body || {};
  const u = await currentUser(req);
  const lead = {
    id: uuid(), name: b.name, email: b.email, phone: b.phone,
    project: b.project || "Any", requirement: b.requirement || "Residential",
    budget: b.budget || "", message: b.message || "",
    preferred_contact_time: b.preferred_contact_time || "", status: "new", created_at: nowIso(),
    email_lower: String(b.email || "").toLowerCase(),
    user_id: u ? u.user_id : null,
  };
  if (!b.website) await db.collection("leads").insertOne({ ...lead });
  res.json(lead);
}));

r.post("/site-visits", wrap(async (req, res) => {
  const db = await getDb();
  const b = req.body || {};
  const u = await currentUser(req);
  const visit = {
    id: uuid(), name: b.name, email: b.email, phone: b.phone, project: b.project || "Any",
    visit_date: b.visit_date || "", time_slot: b.time_slot || "", guests: b.guests || "",
    notes: b.notes || "", status: "new", created_at: nowIso(),
    email_lower: String(b.email || "").toLowerCase(),
    user_id: u ? u.user_id : null,
  };
  if (!b.website) await db.collection("site_visits").insertOne({ ...visit });
  res.json(visit);
}));

// -------- Admin: auth (credentials come from ADMIN_USERNAME / ADMIN_PASSWORD env) --------
r.post("/admin/login", wrap(async (req, res) => {
  const b = req.body || {};
  const username = String(b.username || b.email || "").trim();
  const password = String(b.password || "");
  const okUser = username.toLowerCase() === String(ADMIN_USERNAME).toLowerCase();
  const okPass = password === String(ADMIN_PASSWORD);
  if (!okUser || !okPass) return res.status(401).json({ detail: "Invalid username or password" });
  res.json({ access_token: signToken(ADMIN_USERNAME), token_type: "bearer", username: ADMIN_USERNAME, email: ADMIN_EMAIL });
}));

r.get("/admin/me", requireAdmin, (req, res) => res.json(req.admin));

r.get("/admin/stats", requireAdmin, wrap(async (req, res) => {
  const db = await getDb();
  const P = db.collection("projects");
  res.json({
    total_projects: await P.countDocuments({}),
    delivered: await P.countDocuments({ status: "DELIVERED" }),
    ongoing: await P.countDocuments({ status: "ONGOING" }),
    upcoming: await P.countDocuments({ status: "UPCOMING" }),
    total_leads: await db.collection("leads").countDocuments({}),
    new_leads: await db.collection("leads").countDocuments({ status: "new" }),
    total_visits: await db.collection("site_visits").countDocuments({}),
    new_visits: await db.collection("site_visits").countDocuments({ status: "new" }),
  });
}));

// -------- Admin: projects --------
const projectDefaults = (b) => ({
  name: b.name, slug: b.slug || slugify(b.name), tagline: b.tagline || "", status: b.status || "UPCOMING",
  possession: b.possession || "", delivery_year: b.delivery_year || "", location: b.location || "",
  full_address: b.full_address || "", city: b.city || "", type: b.type || "Residential",
  unit_types: b.unit_types || [], key_units: b.key_units || "", price_range: b.price_range || "",
  rera_numbers: b.rera_numbers || [], rera_registered_date: b.rera_registered_date || "",
  rera_certificate_url: b.rera_certificate_url || "", amenities: b.amenities || [], description: b.description || "",
  highlights: b.highlights || [], hero_image: b.hero_image || "", logo_image: b.logo_image || "",
  gallery: b.gallery || [], video_url: b.video_url || "", brochure_url: b.brochure_url || "",
  map_lat: b.map_lat ?? null, map_lng: b.map_lng ?? null, landmarks: b.landmarks || [],
  land_area: b.land_area || "", unit_area: b.unit_area || "", floor_count: b.floor_count || "",
  specifications: b.specifications || "", internal_features: b.internal_features || [], external_features: b.external_features || [],
  unit_categories: b.unit_categories || [],
  show_in_slider: !!b.show_in_slider, slider_order: b.slider_order ?? 99,
  featured: !!b.featured, hot_selling: !!b.hot_selling, order: b.order ?? 99,
  visible: b.visible !== false,
});

r.post("/admin/projects", requireAdmin, wrap(async (req, res) => {
  const db = await getDb();
  const data = projectDefaults(req.body || {});
  const id = uuid();
  if (await db.collection("projects").findOne({ slug: data.slug })) data.slug = `${data.slug}-${id.slice(0, 6)}`;
  const doc = { ...data, id, created_at: nowIso(), updated_at: nowIso() };
  await db.collection("projects").insertOne({ ...doc });
  res.json(doc);
}));

r.put("/admin/projects/:id", requireAdmin, wrap(async (req, res) => {
  const db = await getDb();
  const existing = await db.collection("projects").findOne({ id: req.params.id }, { projection: { _id: 0 } });
  if (!existing) return res.status(404).json({ detail: "Project not found" });
  const data = projectDefaults(req.body || {});
  const doc = { ...data, id: req.params.id, created_at: existing.created_at || nowIso(), updated_at: nowIso() };
  await db.collection("projects").replaceOne({ id: req.params.id }, { ...doc });
  res.json(doc);
}));

r.delete("/admin/projects/:id", requireAdmin, wrap(async (req, res) => {
  const db = await getDb();
  const del = await db.collection("projects").deleteOne({ id: req.params.id });
  if (!del.deletedCount) return res.status(404).json({ detail: "Project not found" });
  res.json({ success: true });
}));

r.get("/admin/projects", requireAdmin, wrap(async (req, res) => {
  const db = await getDb();
  const docs = await db.collection("projects").find({}, { projection: { _id: 0 } }).limit(500).toArray();
  docs.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  res.json(docs);
}));

// -------- Admin: leads --------
r.get("/admin/leads", requireAdmin, wrap(async (req, res) => {
  const db = await getDb();
  const docs = await db.collection("leads").find({}, { projection: { _id: 0 } }).sort({ created_at: -1 }).limit(1000).toArray();
  docs.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
  res.json(docs);
}));
r.put("/admin/leads/:id", requireAdmin, wrap(async (req, res) => {
  const db = await getDb();
  const u = await db.collection("leads").updateOne({ id: req.params.id }, { $set: { status: (req.body || {}).status || "new" } });
  if (!u.matchedCount) return res.status(404).json({ detail: "Lead not found" });
  res.json(await db.collection("leads").findOne({ id: req.params.id }, { projection: { _id: 0 } }));
}));
r.delete("/admin/leads/:id", requireAdmin, wrap(async (req, res) => {
  const db = await getDb();
  const del = await db.collection("leads").deleteOne({ id: req.params.id });
  if (!del.deletedCount) return res.status(404).json({ detail: "Lead not found" });
  res.json({ success: true });
}));

// -------- Admin: site visits --------
r.get("/admin/site-visits", requireAdmin, wrap(async (req, res) => {
  const db = await getDb();
  const docs = await db.collection("site_visits").find({}, { projection: { _id: 0 } }).toArray();
  docs.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
  res.json(docs);
}));
r.put("/admin/site-visits/:id", requireAdmin, wrap(async (req, res) => {
  const db = await getDb();
  const u = await db.collection("site_visits").updateOne({ id: req.params.id }, { $set: { status: (req.body || {}).status || "new" } });
  if (!u.matchedCount) return res.status(404).json({ detail: "Site visit not found" });
  res.json(await db.collection("site_visits").findOne({ id: req.params.id }, { projection: { _id: 0 } }));
}));
r.delete("/admin/site-visits/:id", requireAdmin, wrap(async (req, res) => {
  const db = await getDb();
  const del = await db.collection("site_visits").deleteOne({ id: req.params.id });
  if (!del.deletedCount) return res.status(404).json({ detail: "Site visit not found" });
  res.json({ success: true });
}));

// Manually run today's site-visit reminder digest (for testing / on-demand resend).
r.post("/admin/visit-reminders/run", requireAdmin, wrap(async (req, res) => {
  const force = !!(req.body || {}).force;
  try {
    const result = await runVisitReminders({ force });
    res.json(result);
  } catch (e) {
    if (e.billing) return res.status(503).json({ detail: e.message });
    console.error("visit reminder run failed", e.message);
    res.status(502).json({ detail: "Could not send reminders: " + e.message });
  }
}));

// -------- Admin: content --------
r.put("/admin/content", requireAdmin, wrap(async (req, res) => {
  const db = await getDb();
  const body = { ...(req.body || {}) };
  delete body._id;
  body.key = "main";
  await db.collection("site_content").replaceOne({ key: "main" }, body, { upsert: true });
  res.json(await db.collection("site_content").findOne({ key: "main" }, { projection: { _id: 0 } }));
}));

// -------- Admin: team --------
r.post("/admin/team", requireAdmin, wrap(async (req, res) => {
  const db = await getDb();
  const b = req.body || {};
  const doc = { id: b.id || uuid(), name: b.name, role: b.role, expertise: b.expertise || "", bio: b.bio || "", image: b.image || "", order: b.order ?? 99 };
  await db.collection("team").insertOne({ ...doc });
  res.json(doc);
}));
r.put("/admin/team/:id", requireAdmin, wrap(async (req, res) => {
  const db = await getDb();
  const b = req.body || {};
  const doc = { id: req.params.id, name: b.name, role: b.role, expertise: b.expertise || "", bio: b.bio || "", image: b.image || "", order: b.order ?? 99 };
  const u = await db.collection("team").replaceOne({ id: req.params.id }, { ...doc });
  if (!u.matchedCount) return res.status(404).json({ detail: "Team member not found" });
  res.json(doc);
}));
r.delete("/admin/team/:id", requireAdmin, wrap(async (req, res) => {
  const db = await getDb();
  const del = await db.collection("team").deleteOne({ id: req.params.id });
  if (!del.deletedCount) return res.status(404).json({ detail: "Team member not found" });
  res.json({ success: true });
}));

// -------- Admin: faqs --------
r.post("/admin/faqs", requireAdmin, wrap(async (req, res) => {
  const db = await getDb();
  const b = req.body || {};
  const doc = { id: uuid(), q: b.q || "", a: b.a || "", order: b.order ?? 99 };
  await db.collection("faqs").insertOne({ ...doc });
  res.json(doc);
}));
r.put("/admin/faqs/:id", requireAdmin, wrap(async (req, res) => {
  const db = await getDb();
  const b = req.body || {};
  await db.collection("faqs").updateOne({ id: req.params.id }, { $set: { q: b.q || "", a: b.a || "", order: b.order ?? 99 } });
  res.json(await db.collection("faqs").findOne({ id: req.params.id }, { projection: { _id: 0 } }));
}));
r.delete("/admin/faqs/:id", requireAdmin, wrap(async (req, res) => {
  const db = await getDb();
  await db.collection("faqs").deleteOne({ id: req.params.id });
  res.json({ success: true });
}));

// -------- Admin: upload (stored in MongoDB) --------
r.post("/admin/upload", requireAdmin, upload.single("file"), wrap(async (req, res) => {
  const db = await getDb();
  if (!req.file) return res.status(400).json({ detail: "No file" });
  const orig = req.file.originalname || "";
  const ext = ("." + (orig.split(".").pop() || "")).toLowerCase();
  if (!ALLOWED_EXT.includes(ext)) return res.status(400).json({ detail: `Unsupported file type: ${ext}` });
  const filename = `${uuid().replace(/-/g, "")}${ext}`;
  await db.collection("uploads").insertOne({
    filename, contentType: req.file.mimetype, data: req.file.buffer.toString("base64"), created_at: nowIso(),
  });
  res.json({ url: `/api/uploads/${filename}`, filename });
}));

// -------- Admin: posts --------
r.get("/admin/posts", requireAdmin, wrap(async (req, res) => {
  const db = await getDb();
  const docs = await db.collection("posts").find({}, { projection: { _id: 0 } }).toArray();
  docs.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  res.json(docs);
}));
const postDefaults = (b) => ({
  title: b.title, slug: b.slug || slugify(b.title), category: b.category || "Blog", excerpt: b.excerpt || "",
  content: b.content || "", cover_image: b.cover_image || "", author: b.author || "Homeland Group",
  date: b.date || nowIso().slice(0, 10), published: b.published !== false,
});
r.post("/admin/posts", requireAdmin, wrap(async (req, res) => {
  const db = await getDb();
  const data = postDefaults(req.body || {});
  const id = uuid();
  if (await db.collection("posts").findOne({ slug: data.slug })) data.slug = `${data.slug}-${id.slice(0, 6)}`;
  const doc = { ...data, id, created_at: nowIso(), updated_at: nowIso() };
  await db.collection("posts").insertOne({ ...doc });
  res.json(doc);
}));
r.put("/admin/posts/:id", requireAdmin, wrap(async (req, res) => {
  const db = await getDb();
  const existing = await db.collection("posts").findOne({ id: req.params.id }, { projection: { _id: 0 } });
  if (!existing) return res.status(404).json({ detail: "Post not found" });
  const data = postDefaults(req.body || {});
  const doc = { ...data, id: req.params.id, created_at: existing.created_at || nowIso(), updated_at: nowIso() };
  await db.collection("posts").replaceOne({ id: req.params.id }, { ...doc });
  res.json(doc);
}));
r.delete("/admin/posts/:id", requireAdmin, wrap(async (req, res) => {
  const db = await getDb();
  const del = await db.collection("posts").deleteOne({ id: req.params.id });
  if (!del.deletedCount) return res.status(404).json({ detail: "Post not found" });
  res.json({ success: true });
}));

// -------- Admin: updates (daily feed) --------
r.get("/admin/updates", requireAdmin, wrap(async (req, res) => {
  const db = await getDb();
  const docs = await db.collection("updates").find({}, { projection: { _id: 0 } }).toArray();
  docs.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (b.date || "").localeCompare(a.date || ""));
  res.json(docs);
}));
const updateDefaults = (b) => ({
  title: b.title, category: b.category || "Update", excerpt: b.excerpt || "", body: b.body || "",
  image: b.image || "", link_type: b.link_type || "none", project_slug: b.project_slug || "",
  external_url: b.external_url || "", social_platform: b.social_platform || "", venue: b.venue || "",
  date: b.date || nowIso().slice(0, 10), pinned: !!b.pinned, published: b.published !== false,
});
r.post("/admin/updates", requireAdmin, wrap(async (req, res) => {
  const db = await getDb();
  const data = updateDefaults(req.body || {});
  const doc = { ...data, id: uuid(), created_at: nowIso(), updated_at: nowIso() };
  await db.collection("updates").insertOne({ ...doc });
  res.json(doc);
}));
r.put("/admin/updates/:id", requireAdmin, wrap(async (req, res) => {
  const db = await getDb();
  const existing = await db.collection("updates").findOne({ id: req.params.id }, { projection: { _id: 0 } });
  if (!existing) return res.status(404).json({ detail: "Update not found" });
  const data = updateDefaults(req.body || {});
  const doc = { ...data, id: req.params.id, created_at: existing.created_at || nowIso(), updated_at: nowIso() };
  await db.collection("updates").replaceOne({ id: req.params.id }, { ...doc });
  res.json(doc);
}));
r.delete("/admin/updates/:id", requireAdmin, wrap(async (req, res) => {
  const db = await getDb();
  const del = await db.collection("updates").deleteOne({ id: req.params.id });
  if (!del.deletedCount) return res.status(404).json({ detail: "Update not found" });
  res.json({ success: true });
}));

// -------- Admin: AI design assistant --------
r.post("/admin/ai/design", requireAdmin, wrap(async (req, res) => {
  const db = await getDb();
  const content = await db.collection("site_content").findOne({ key: "main" }, { projection: { _id: 0 } });
  const ai = content?.ai || {};
  const prompt = (req.body || {}).prompt || "";
  if (!prompt) return res.status(400).json({ detail: "Prompt required" });
  const allowedFonts = ["Playfair Display", "Crimson Text", "Montserrat", "Figtree", "Fredoka", "Source Code Pro", "Roboto Mono"];
  const sys = `You are a senior brand and UI designer for a luxury real-estate website. Given a design request, output ONLY a compact JSON object (no markdown, no prose) with keys: font_display, font_body, font_scale, gold, bg_dark, bg_light, hero_text.\n- font_display and font_body MUST each be one of: ${allowedFonts.join(", ")}.\n- font_scale is a number between 0.9 and 1.12.\n- gold is the accent colour hex; bg_dark is the dark-mode page background hex; bg_light is the light-mode page background hex; hero_text is a light hex used over hero photos.\n- Use rich, premium shades. Avoid pure #000000 or #FFFFFF and garish primary colours. Ensure strong contrast.\nReturn JSON only.`;
  try {
    const raw = await callLLM([{ role: "system", content: sys }, { role: "user", content: String(prompt).slice(0, 500) }], { provider: ai.provider || "openai", model: ai.model || "gpt-5.4" });
    const match = raw.match(/\{[\s\S]*\}/);
    const theme = JSON.parse(match ? match[0] : raw);
    const clean = {};
    if (allowedFonts.includes(theme.font_display)) clean.font_display = theme.font_display;
    if (allowedFonts.includes(theme.font_body)) clean.font_body = theme.font_body;
    const fsv = parseFloat(theme.font_scale);
    if (!Number.isNaN(fsv)) clean.font_scale = Math.min(1.12, Math.max(0.9, fsv));
    const hex = (v) => (typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v) ? v : null);
    for (const k of ["gold", "bg_dark", "bg_light", "hero_text"]) { const h = hex(theme[k]); if (h) clean[k] = h; }
    res.json({ theme: clean, raw });
  } catch (e) {
    console.error("ai design error", e.message);
    res.status(503).json({ detail: "Could not generate a theme. Please try again." });
  }
}));

// All REST routes live under /api.
app.use("/api", r);

// Serve the built React frontend from the same Node process and fall back to
// index.html for client-side (SPA) routes. The API stays under /api.
// If no build is present yet, expose the API at the root as a safety net.
const FRONTEND_BUILD = process.env.FRONTEND_BUILD_DIR || path.join(__dirname, "..", "frontend", "build");
if (fs.existsSync(path.join(FRONTEND_BUILD, "index.html"))) {
  app.use(express.static(FRONTEND_BUILD));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(FRONTEND_BUILD, "index.html"));
  });
} else {
  app.use("/", r);
}

module.exports = app;

// Allow running as a standalone server locally (node api/index.js)
if (require.main === module) {
  // Hostinger managed Node.js hosting proxies to port 3000 by default; Emergent
  // preview and VPS/PM2 inject PORT explicitly. So honor PORT, else default 3000.
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Homeland Node API listening on :${port}`));

  // Morning site-visit reminders. Runs in-process (works on Hostinger's persistent
  // Node app / PM2 — no external cron needed). Fires daily at 07:00 in REMINDER_TZ.
  try {
    const cron = require("node-cron");
    const tz = process.env.REMINDER_TZ || "Asia/Kolkata";
    cron.schedule("0 7 * * *", async () => {
      try {
        const r = await runVisitReminders();
        if (r.sent) console.log(`[reminders] sent digest for ${r.date}: ${r.count} visit(s) -> ${r.recipient}`);
      } catch (e) {
        console.error("[reminders] failed:", e.message);
      }
    }, { timezone: tz });
    console.log(`[reminders] scheduled daily at 07:00 ${tz}`);
  } catch (e) {
    console.error("[reminders] scheduler not started:", e.message);
  }
}
