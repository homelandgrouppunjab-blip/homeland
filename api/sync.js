// Mongo -> MySQL one-way mirror (MongoDB is the source of truth).
//
// Activates ONLY when MONGO_URL is set. If it is not set, this is a safe no-op,
// so a pure-MySQL Hostinger deploy keeps working exactly as before.
//
// Behaviour:
//   - On startup it runs a full initial copy (the "one-time copy").
//   - Then (unless MONGO_SYNC_INTERVAL_SEC=0) it re-mirrors every N seconds so
//     MySQL stays up to date with whatever is in MongoDB.
//   - It UPSERTS documents into MySQL keyed by id / session_token / filename.
//   - It NEVER deletes MySQL rows unless MONGO_SYNC_DELETE=1, so it can't nuke
//     data by surprise.
//   - It never throws into the app lifecycle: if Mongo is briefly unreachable
//     the API keeps serving from MySQL and the next cycle retries.
//
// Env:
//   MONGO_URL                 MongoDB connection string (enables the mirror)
//   MONGO_DB_NAME             optional; defaults to the DB in the URL
//   MONGO_SYNC_INTERVAL_SEC   default 60; set 0 for a one-time copy only
//   MONGO_SYNC_DELETE         "1"/"true" to remove MySQL rows missing from Mongo

const mysqlDb = require("./db");

let MongoClient = null;
try { ({ MongoClient } = require("mongodb")); } catch (_) { MongoClient = null; }

const log = (...a) => console.log("[sync]", ...a);
const errlog = (...a) => console.error("[sync]", ...a);

const truthy = (v) => v === "1" || v === "true" || v === "yes";

let client = null;
let running = false;
let timer = null;

async function getMongoDb() {
  const url = process.env.MONGO_URL;
  if (!url) return null;
  if (!MongoClient) throw new Error("mongodb driver not installed");
  if (!client) {
    client = new MongoClient(url, { serverSelectionTimeoutMS: 8000 });
    await client.connect();
  }
  const name = process.env.MONGO_DB_NAME;
  return name ? client.db(name) : client.db();
}

// Choose the stable key a document should be matched/upserted by in MySQL.
function keyFilter(doc) {
  if (doc.id != null) return { id: doc.id };
  if (doc.session_token != null) return { session_token: doc.session_token };
  if (doc.filename != null) return { filename: doc.filename };
  return null;
}

function keyValue(doc) {
  const f = keyFilter(doc);
  return f ? String(Object.values(f)[0]) : null;
}

// Run a single full mirror pass. Returns a per-collection summary.
async function syncOnce() {
  if (running) { log("skip: a sync is already running"); return { skipped: true }; }
  const mdb0 = process.env.MONGO_URL ? undefined : null;
  if (mdb0 === null) return { disabled: true };

  running = true;
  const started = Date.now();
  const summary = {};
  try {
    const mdb = await getMongoDb();
    if (!mdb) return { disabled: true };

    const doDelete = truthy(process.env.MONGO_SYNC_DELETE || "");
    const mysql = await mysqlDb.getDb();

    // Mirror every collection the app knows about, plus any extra collection
    // that actually exists in Mongo.
    let names = mysqlDb.COLLECTIONS.slice();
    try {
      const existing = (await mdb.listCollections().toArray()).map((c) => c.name);
      for (const n of existing) if (!names.includes(n)) names.push(n);
    } catch (_) { /* listCollections may be restricted; fall back to known list */ }

    for (const name of names) {
      let docs;
      try { docs = await mdb.collection(name).find({}).toArray(); }
      catch (_) { continue; }

      const col = mysql.collection(name);
      let upserts = 0;
      const seen = new Set();

      for (const raw of docs) {
        const { _id, ...rest } = raw;              // drop Mongo's ObjectId
        let filter = keyFilter(rest);
        if (!filter) {                              // ensure a stable id to match on
          rest.id = _id != null ? String(_id) : require("crypto").randomUUID();
          filter = { id: rest.id };
        }
        seen.add(keyValue(rest));
        await col.replaceOne(filter, rest, { upsert: true });
        upserts++;
      }

      let deletes = 0;
      if (doDelete) {
        const current = await col.find({}).toArray();
        for (const c of current) {
          const f = keyFilter(c);
          if (f && !seen.has(keyValue(c))) { await col.deleteOne(f); deletes++; }
        }
      }
      summary[name] = { upserts, deletes };
    }

    const ms = Date.now() - started;
    log(`mirror complete in ${ms}ms`, JSON.stringify(summary));
    return { ok: true, ms, summary };
  } catch (e) {
    errlog("mirror failed:", e.message);
    return { ok: false, error: e.message };
  } finally {
    running = false;
  }
}

// Kick off the mirror if MONGO_URL is configured. Safe to call unconditionally.
function start() {
  if (!process.env.MONGO_URL) {
    log("MONGO_URL not set — Mongo->MySQL mirror disabled (pure MySQL mode)");
    return;
  }
  if (!MongoClient) {
    errlog("mongodb driver missing — cannot start mirror");
    return;
  }
  const interval = parseInt(process.env.MONGO_SYNC_INTERVAL_SEC || "60", 10);
  const del = truthy(process.env.MONGO_SYNC_DELETE || "");
  log(`Mongo->MySQL mirror enabled (source of truth = MongoDB, interval=${interval}s, delete=${del})`);

  // Initial full copy on boot.
  syncOnce();

  if (interval > 0) {
    timer = setInterval(() => { syncOnce(); }, interval * 1000);
    if (timer.unref) timer.unref(); // don't keep the process alive just for this
  }
}

module.exports = { start, syncOnce };
