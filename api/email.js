// Emergent Managed Email (Resend) — Node.js helper.
// The sending domain is platform-verified; the From address is managed by the
// platform and cannot be set. We set the display name via EMAIL_FROM_NAME.
// Base URL is a hardcoded CONSTANT (survives deployment) — never read from env.
const EMAIL_BASE_URL = "https://integrations.emergentagent.com";

const SHORTENERS = ["bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly"];

function hostOk(host) {
  if (!host || host.includes("xn--")) return false;
  // reject IPv4 / IPv6 literals
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return false;
  if (host.includes(":")) return false;
  return !SHORTENERS.some((s) => host === s || host.endsWith("." + s));
}

// Best-effort structural guard (G2 + G3): no forms/inputs, only absolute https
// links/assets, no credential-ask phrasing. Bodies must be server-side templates.
function assertSafeEmail(subject, html) {
  const body = `${subject}\n${html}`.toLowerCase();
  if (/<\s*(form|input|textarea|select)\b/i.test(html)) {
    throw new Error("No forms or input fields allowed in email (G2)");
  }
  const credAsk = [
    "reply with your password", "reply with the code", "send your password",
    "send us your password", "enter your password below", "confirm your card number",
    "your full card number", "seed phrase", "recovery phrase", "verify your card",
    "social security number", "confirm your bank details", "cvv",
  ];
  for (const p of credAsk) {
    if (body.includes(p)) throw new Error(`Email asks the recipient for credentials: ${p} (G2)`);
  }
  const urls = [];
  const re = /(?:href|src)\s*=\s*["']?([^"'\s>]+)/gi;
  let m;
  while ((m = re.exec(html)) !== null) urls.push(m[1]);
  for (const url of urls) {
    const low = url.trim().toLowerCase();
    if (low.startsWith("mailto:") || low.startsWith("tel:") || low.startsWith("cid:") || low.startsWith("#")) continue;
    if (!low.startsWith("https://")) throw new Error(`Email links/assets must be absolute https: ${url} (G3)`);
    let host = "";
    try { host = new URL(low).hostname; } catch { host = ""; }
    if (!hostOk(host) || new URL(low).username) throw new Error(`Shortened/numeric/credential URL: ${url} (G3)`);
  }
}

// Internal helper. `html` must come from a server-side template, never request input.
async function sendEmail({ to, subject, html, replyTo }) {
  const key = process.env.EMERGENT_EMAIL_KEY;
  const fromName = process.env.EMAIL_FROM_NAME;
  if (!key) throw new Error("EMERGENT_EMAIL_KEY not configured");
  if (!fromName) throw new Error("EMAIL_FROM_NAME not configured (required)");
  assertSafeEmail(subject, html);
  const payload = { to: Array.isArray(to) ? to : [to], subject, html, from_name: fromName };
  const rt = replyTo || process.env.EMAIL_REPLY_TO;
  if (rt) payload.contact_email = rt;

  const resp = await fetch(`${EMAIL_BASE_URL}/api/v1/email/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Email-Key": key },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    let codeBody = {};
    try { codeBody = await resp.json(); } catch { /* ignore */ }
    const code = codeBody.code || "";
    const billing = ["insufficient_credits", "integration_disabled", "daily_limit_reached"];
    if (billing.includes(code)) {
      const err = new Error(`Email paused: ${code} — ${codeBody.message || ""}`);
      err.billing = true;
      throw err;
    }
    throw new Error(`Email send failed: ${resp.status}`);
  }
  const data = await resp.json().catch(() => ({}));
  return data.id || null;
}

module.exports = { sendEmail, assertSafeEmail };
