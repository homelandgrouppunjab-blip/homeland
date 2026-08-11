// Homeland Group — Vercel-native REST API (Node.js + native MongoDB driver)
// No Python/FastAPI. Deploys as a Vercel serverless function.
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { MongoClient } = require("mongodb");
const seed = require("./seed-data.json");

const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME || "homeland";
const JWT_SECRET = process.env.JWT_SECRET || "change-me";
const JWT_EXPIRE_MINUTES = parseInt(process.env.JWT_EXPIRE_MINUTES || "1440", 10);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@homelandgroup.org";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Homeland@2013";
const ALLOWED_EXT = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif", ".pdf"];

// ---- Cached connection (serverless-safe) ----
let cached = global._mongo;
if (!cached) cached = global._mongo = { client: null, db: null, seeded: false };

async function getDb() {
  if (cached.db) return cached.db;
  if (!cached.client) {
    cached.client = new MongoClient(MONGO_URL, { maxPoolSize: 10 });
    await cached.client.connect();
  }
  cached.db = cached.client.db(DB_NAME);
  await ensureSeed(cached.db);
  return cached.db;
}

const nowIso = () => new Date().toISOString();
const uuid = () => crypto.randomUUID();
const slugify = (t) =>
  (t || "").toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/[\s_-]+/g, "-");

async function ensureSeed(db) {
  if (cached.seeded) return;
  cached.seeded = true;
  // Admin
  const admin = await db.collection("admins").findOne({ email: ADMIN_EMAIL });
  if (!admin) {
    await db.collection("admins").insertOne({
      id: uuid(),
      email: ADMIN_EMAIL,
      password_hash: bcrypt.hashSync(ADMIN_PASSWORD, 10),
      created_at: nowIso(),
    });
  }
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
app.use(cors());
app.use(express.json({ limit: "2mb" }));
const r = express.Router();

const wrap = (fn) => (req, res) => Promise.resolve(fn(req, res)).catch((e) => {
  console.error(e);
  res.status(500).json({ detail: "Server error" });
});

// -------- Public --------
r.get("/", (req, res) => res.json({ message: "Homeland Group Mohali API", status: "ok" }));

r.get("/projects", wrap(async (req, res) => {
  const db = await getDb();
  const q = {};
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
  let docs = await db.collection("projects").find(q, { projection: { _id: 0 } }).toArray();
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
  const lead = {
    id: uuid(), name: b.name, email: b.email, phone: b.phone,
    project: b.project || "Any", requirement: b.requirement || "Residential",
    budget: b.budget || "", message: b.message || "",
    preferred_contact_time: b.preferred_contact_time || "", status: "new", created_at: nowIso(),
  };
  if (!b.website) await db.collection("leads").insertOne({ ...lead });
  res.json(lead);
}));

r.post("/site-visits", wrap(async (req, res) => {
  const db = await getDb();
  const b = req.body || {};
  const visit = {
    id: uuid(), name: b.name, email: b.email, phone: b.phone, project: b.project || "Any",
    visit_date: b.visit_date || "", time_slot: b.time_slot || "", guests: b.guests || "",
    notes: b.notes || "", status: "new", created_at: nowIso(),
  };
  if (!b.website) await db.collection("site_visits").insertOne({ ...visit });
  res.json(visit);
}));

// -------- Admin: auth --------
r.post("/admin/login", wrap(async (req, res) => {
  const db = await getDb();
  const { email, password } = req.body || {};
  const admin = await db.collection("admins").findOne({ email });
  if (!admin || !bcrypt.compareSync(password || "", admin.password_hash || ""))
    return res.status(401).json({ detail: "Invalid email or password" });
  res.json({ access_token: signToken(email), token_type: "bearer", email });
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
  featured: !!b.featured, hot_selling: !!b.hot_selling, order: b.order ?? 99,
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
  const docs = await db.collection("projects").find({}, { projection: { _id: 0 } }).toArray();
  docs.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  res.json(docs);
}));

// -------- Admin: leads --------
r.get("/admin/leads", requireAdmin, wrap(async (req, res) => {
  const db = await getDb();
  const docs = await db.collection("leads").find({}, { projection: { _id: 0 } }).toArray();
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

// Mount router at both /api and / so it works with any Vercel rewrite target.
app.use("/api", r);
app.use("/", r);

module.exports = app;

// Allow running as a standalone server locally (node api/index.js)
if (require.main === module) {
  const port = process.env.PORT || 8002;
  app.listen(port, () => console.log(`Homeland Node API listening on :${port}`));
}
