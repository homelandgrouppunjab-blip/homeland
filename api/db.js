// MySQL data layer with a small MongoDB-compatible API, so the existing
// index.js code (db.collection("x").findOne/find/insertOne/updateOne/...) keeps
// working with minimal changes. Each "collection" is a table:
//   `name` (id VARCHAR PK, data LONGTEXT holding the JSON document)
// Query/update matching for the operator subset actually used by the app is done
// in JS (data volumes here are small). This keeps documents flexible like Mongo.
const mysql = require("mysql2/promise");
const crypto = require("crypto");

const COLLECTIONS = [
  "admins", "faqs", "leads", "posts", "projects", "site_content",
  "site_visits", "team", "updates", "uploads", "user_sessions", "users",
];

let pool = null;
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || "127.0.0.1",
      port: parseInt(process.env.MYSQL_PORT || "3306", 10),
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "",
      database: process.env.MYSQL_DATABASE || "homeland",
      waitForConnections: true,
      connectionLimit: parseInt(process.env.MYSQL_POOL || "10", 10),
      charset: "utf8mb4",
    });
  }
  return pool;
}

let initialized = false;
async function init() {
  if (initialized) return;
  const p = getPool();
  for (const c of COLLECTIONS) {
    await p.query(
      "CREATE TABLE IF NOT EXISTS `" + c + "` (" +
      "id VARCHAR(191) NOT NULL PRIMARY KEY, data LONGTEXT NOT NULL" +
      ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    );
  }
  initialized = true;
  console.log("[mysql] connected & tables ready:", process.env.MYSQL_DATABASE || "homeland");
}

// ---- matching ----
function looseEq(a, b) {
  if (a === b) return true;
  if (Array.isArray(a)) return a.some((x) => x === b);
  return false;
}

function matchValue(docVal, cond) {
  if (cond !== null && typeof cond === "object" && !Array.isArray(cond) && !(cond instanceof RegExp)) {
    const keys = Object.keys(cond);
    const isOps = keys.length > 0 && keys.every((k) => k.startsWith("$"));
    if (isOps) {
      for (const op of keys) {
        const v = cond[op];
        if (op === "$ne") { if (looseEq(docVal, v)) return false; }
        else if (op === "$in") { if (!Array.isArray(v) || !v.some((x) => looseEq(docVal, x))) return false; }
        else if (op === "$nin") { if (Array.isArray(v) && v.some((x) => looseEq(docVal, x))) return false; }
        else if (op === "$exists") { if ((docVal !== undefined) !== !!v) return false; }
        else if (op === "$regex") {
          const re = v instanceof RegExp ? v : new RegExp(v, cond.$options || "");
          if (docVal == null || !re.test(String(docVal))) return false;
        }
        else if (op === "$options") { /* consumed by $regex */ }
        else if (op === "$gt") { if (!(docVal > v)) return false; }
        else if (op === "$gte") { if (!(docVal >= v)) return false; }
        else if (op === "$lt") { if (!(docVal < v)) return false; }
        else if (op === "$lte") { if (!(docVal <= v)) return false; }
        else { return false; }
      }
      return true;
    }
  }
  if (cond instanceof RegExp) return docVal != null && cond.test(String(docVal));
  return looseEq(docVal, cond);
}

function matchDoc(doc, query) {
  if (!query) return true;
  for (const key of Object.keys(query)) {
    if (key === "$or") { if (!(query.$or || []).some((s) => matchDoc(doc, s))) return false; continue; }
    if (key === "$and") { if (!(query.$and || []).every((s) => matchDoc(doc, s))) return false; continue; }
    if (key === "$nor") { if ((query.$nor || []).some((s) => matchDoc(doc, s))) return false; continue; }
    if (!matchValue(doc[key], query[key])) return false;
  }
  return true;
}

function applyUpdate(doc, update) {
  const d = { ...doc };
  if (update.$set) Object.assign(d, update.$set);
  if (update.$unset) for (const k of Object.keys(update.$unset)) delete d[k];
  if (update.$addToSet) for (const [k, v] of Object.entries(update.$addToSet)) {
    const arr = Array.isArray(d[k]) ? d[k].slice() : [];
    if (!arr.some((x) => x === v)) arr.push(v);
    d[k] = arr;
  }
  if (update.$pull) for (const [k, v] of Object.entries(update.$pull)) {
    if (Array.isArray(d[k])) d[k] = d[k].filter((x) => x !== v);
  }
  if (update.$push) for (const [k, v] of Object.entries(update.$push)) {
    const arr = Array.isArray(d[k]) ? d[k].slice() : [];
    arr.push(v); d[k] = arr;
  }
  if (update.$inc) for (const [k, v] of Object.entries(update.$inc)) d[k] = (d[k] || 0) + v;
  return d;
}

// Build a base doc for an upsert from the filter's equality fields.
function filterEqualityFields(query) {
  const base = {};
  for (const [k, v] of Object.entries(query || {})) {
    if (k.startsWith("$")) continue;
    if (v === null || typeof v !== "object" || Array.isArray(v)) base[k] = v;
  }
  return base;
}

const rowId = (doc) => String(doc.id || doc.session_token || doc._pk || crypto.randomUUID());

function sortDocs(docs, sortSpec) {
  if (!sortSpec) return docs;
  const keys = Object.keys(sortSpec);
  return docs.slice().sort((a, b) => {
    for (const k of keys) {
      const dir = sortSpec[k] < 0 ? -1 : 1;
      const av = a[k], bv = b[k];
      if (av === bv) continue;
      if (av === undefined || av === null) return 1 * dir;
      if (bv === undefined || bv === null) return -1 * dir;
      return (av < bv ? -1 : 1) * dir;
    }
    return 0;
  });
}

function collection(name) {
  if (!COLLECTIONS.includes(name)) COLLECTIONS.push(name); // tolerate new names
  const p = getPool();
  const table = "`" + name + "`";

  async function ensureTable() {
    await p.query("CREATE TABLE IF NOT EXISTS " + table + " (id VARCHAR(191) NOT NULL PRIMARY KEY, data LONGTEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
  }

  async function allRows() {
    await ensureTable();
    const [rows] = await p.query("SELECT id, data FROM " + table);
    return rows.map((r) => ({ _pk: r.id, doc: JSON.parse(r.data) }));
  }

  return {
    async findOne(query, _opts) {
      const rows = await allRows();
      const hit = rows.find((r) => matchDoc(r.doc, query));
      return hit ? hit.doc : null;
    },
    find(query, _opts) {
      let sortSpec = null, limitN = null, skipN = 0;
      const cursor = {
        sort(s) { sortSpec = s; return cursor; },
        limit(n) { limitN = n; return cursor; },
        skip(n) { skipN = n; return cursor; },
        async toArray() {
          const rows = await allRows();
          let docs = rows.filter((r) => matchDoc(r.doc, query)).map((r) => r.doc);
          docs = sortDocs(docs, sortSpec);
          if (skipN) docs = docs.slice(skipN);
          if (limitN != null) docs = docs.slice(0, limitN);
          return docs;
        },
      };
      return cursor;
    },
    async countDocuments(query) {
      const rows = await allRows();
      return rows.filter((r) => matchDoc(r.doc, query || {})).length;
    },
    async insertOne(doc) {
      await ensureTable();
      const id = rowId(doc);
      await p.query("INSERT INTO " + table + " (id, data) VALUES (?, ?)", [id, JSON.stringify(doc)]);
      return { acknowledged: true, insertedId: id };
    },
    async insertMany(docs) {
      await ensureTable();
      if (!docs || !docs.length) return { insertedCount: 0 };
      const values = docs.map((d) => [rowId(d), JSON.stringify(d)]);
      await p.query("INSERT INTO " + table + " (id, data) VALUES ?", [values]);
      return { insertedCount: docs.length };
    },
    async updateOne(query, update, opts = {}) {
      const rows = await allRows();
      const hit = rows.find((r) => matchDoc(r.doc, query));
      if (hit) {
        const next = applyUpdate(hit.doc, update);
        await p.query("UPDATE " + table + " SET data=? WHERE id=?", [JSON.stringify(next), hit._pk]);
        return { matchedCount: 1, modifiedCount: 1, upsertedId: null };
      }
      if (opts.upsert) {
        const base = applyUpdate(filterEqualityFields(query), update);
        const id = rowId(base);
        await p.query("INSERT INTO " + table + " (id, data) VALUES (?, ?)", [id, JSON.stringify(base)]);
        return { matchedCount: 0, modifiedCount: 0, upsertedId: id };
      }
      return { matchedCount: 0, modifiedCount: 0, upsertedId: null };
    },
    async updateMany(query, update) {
      const rows = await allRows();
      const hits = rows.filter((r) => matchDoc(r.doc, query));
      for (const h of hits) {
        const next = applyUpdate(h.doc, update);
        await p.query("UPDATE " + table + " SET data=? WHERE id=?", [JSON.stringify(next), h._pk]);
      }
      return { matchedCount: hits.length, modifiedCount: hits.length };
    },
    async replaceOne(query, doc, opts = {}) {
      const rows = await allRows();
      const hit = rows.find((r) => matchDoc(r.doc, query));
      if (hit) {
        await p.query("UPDATE " + table + " SET data=? WHERE id=?", [JSON.stringify(doc), hit._pk]);
        return { matchedCount: 1, modifiedCount: 1, upsertedId: null };
      }
      if (opts.upsert) {
        const id = rowId(doc);
        await p.query("INSERT INTO " + table + " (id, data) VALUES (?, ?)", [id, JSON.stringify(doc)]);
        return { matchedCount: 0, modifiedCount: 0, upsertedId: id };
      }
      return { matchedCount: 0, modifiedCount: 0, upsertedId: null };
    },
    async deleteOne(query) {
      const rows = await allRows();
      const hit = rows.find((r) => matchDoc(r.doc, query));
      if (!hit) return { deletedCount: 0 };
      await p.query("DELETE FROM " + table + " WHERE id=?", [hit._pk]);
      return { deletedCount: 1 };
    },
    async deleteMany(query) {
      const rows = await allRows();
      const hits = rows.filter((r) => matchDoc(r.doc, query || {}));
      if (!hits.length) return { deletedCount: 0 };
      await p.query("DELETE FROM " + table + " WHERE id IN (?)", [hits.map((h) => h._pk)]);
      return { deletedCount: hits.length };
    },
  };
}

// Mongo-compatible entry point used by index.js: `const db = await getDb();`
async function getDb() {
  if (!process.env.MYSQL_HOST && !process.env.MYSQL_DATABASE) {
    console.warn("[mysql] MYSQL_HOST/MYSQL_DATABASE not set — using defaults 127.0.0.1/homeland");
  }
  await init();
  return { collection };
}

module.exports = { getDb, getPool, collection, init, COLLECTIONS, matchDoc, applyUpdate };
