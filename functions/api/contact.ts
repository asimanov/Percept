// POST /api/contact — supports: cf-email | sendgrid | mailgun (dry-run if none)
export interface Env {
  CONTACT_PROVIDER?: string;          // "cf-email" | "sendgrid" | "mailgun"
  CONTACT_TO?: string;
  CONTACT_FROM?: string;

  // SendGrid
  SENDGRID_API_KEY?: string;

  // Mailgun
  MAILGUN_API_KEY?: string;
  MAILGUN_DOMAIN?: string;

  // Cloudflare Email Worker (HTTPS call)
  EMAILER_URL?: string;               // e.g. https://percept-email.<subdomain>.workers.dev
  EMAILER_TOKEN?: string;             // shared secret you set in the Worker

  // optional CAPTCHA
  TURNSTILE_SECRET?: string;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function parseBody(request: Request) {
  const ct = request.headers.get("content-type") || "";
  if (ct.includes("application/json")) return (await request.json().catch(() => ({}))) as any;
  if (ct.includes("form")) {
    const fd = await request.formData();
    const o: Record<string, any> = {};
    for (const [k, v] of fd.entries()) o[k] = typeof v === "string" ? v : v.name;
    return o;
  }
  return {};
}

async function verifyTurnstile(secret?: string, token?: string) {
  if (!secret) return true;
  if (!token) return false;
  const resp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token }),
  });
  const data = await resp.json().catch(() => ({}));
  return !!data.success;
}

// ---- Providers ----

async function sendWithCfEmail(env: Env, subject: string, text: string, replyTo?: string) {
  if (!env.EMAILER_URL || !env.EMAILER_TOKEN) throw new Error("Missing EMAILER_URL/EMAILER_TOKEN");
  if (!env.CONTACT_TO || !env.CONTACT_FROM) throw new Error("Missing CONTACT_TO/CONTACT_FROM");
  const payload: any = { from: env.CONTACT_FROM, to: env.CONTACT_TO, subject, text };
  if (replyTo) payload.replyTo = replyTo;

  const res = await fetch(env.EMAILER_URL, {
    method: "POST",
    headers: { "content-type": "application/json", "x-email-token": env.EMAILER_TOKEN },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Email worker error: ${res.status} ${await res.text()}`);
}

async function sendWithSendGrid(env: Env, subject: string, text: string) {
  if (!env.SENDGRID_API_KEY) throw new Error("Missing SENDGRID_API_KEY");
  if (!env.CONTACT_TO || !env.CONTACT_FROM) throw new Error("Missing CONTACT_TO/CONTACT_FROM");

  const body = {
    personalizations: [{ to: [{ email: env.CONTACT_TO }] }],
    from: { email: env.CONTACT_FROM },
    subject,
    content: [{ type: "text/plain", value: text }],
  };

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.SENDGRID_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`SendGrid error: ${res.status} ${await res.text()}`);
}

async function sendWithMailgun(env: Env, subject: string, text: string) {
  if (!env.MAILGUN_API_KEY || !env.MAILGUN_DOMAIN) throw new Error("Missing MAILGUN_API_KEY/MAILGUN_DOMAIN");
  if (!env.CONTACT_TO || !env.CONTACT_FROM) throw new Error("Missing CONTACT_TO/CONTACT_FROM");

  const url = `https://api.mailgun.net/v3/${env.MAILGUN_DOMAIN}/messages`;
  const form = new URLSearchParams();
  form.set("from", env.CONTACT_FROM);
  form.set("to", env.CONTACT_TO);
  form.set("subject", subject);
  form.set("text", text);

  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: "Basic " + btoa("api:" + env.MAILGUN_API_KEY), "content-type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  if (!res.ok) throw new Error(`Mailgun error: ${res.status} ${await res.text()}`);
}

// ---- Handler ----

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const data = await parseBody(request);

    // Honeypot — bots tend to fill this
    if (data.website) return new Response(JSON.stringify({ ok: true, dryRun: true, reason: "honeypot" }), { status: 200 });

    const name = (data.name || "").toString().trim();
    const email = (data.email || "").toString().trim();
    const message = (data.message || "").toString().trim();
    const token = (data.turnstile_token || "").toString().trim();

    if (!name) return new Response(JSON.stringify({ ok: false, error: "Name required" }), { status: 400 });
    if (!isValidEmail(email)) return new Response(JSON.stringify({ ok: false, error: "Valid email required" }), { status: 400 });
    if (!message) return new Response(JSON.stringify({ ok: false, error: "Message required" }), { status: 400 });

    const human = await verifyTurnstile(env.TURNSTILE_SECRET, token);
    if (!human) return new Response(JSON.stringify({ ok: false, error: "CAPTCHA failed" }), { status: 400 });

    const subject = `Percept Index contact from ${name}`;
    const text = `From: ${name} <${email}>\n\n${message}`;

    const provider = (env.CONTACT_PROVIDER ?? "").trim().toLowerCase();
    if (!provider) return new Response(JSON.stringify({ ok: true, dryRun: true }), { status: 200 });

    if (provider === "cf-email") await sendWithCfEmail(env, subject, text, email);
    else if (provider === "sendgrid") await sendWithSendGrid(env, subject, text);
    else if (provider === "mailgun") await sendWithMailgun(env, subject, text);
    else return new Response(JSON.stringify({ ok: true, dryRun: true, note: "Unknown CONTACT_PROVIDER" }), { status: 200 });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err?.message || "Internal error" }), { status: 500 });
  }
};