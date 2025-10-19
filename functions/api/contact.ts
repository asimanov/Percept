// POST /api/contact — now simplified to cf-email only (dry-run if none)

export interface Env {
  CONTACT_PROVIDER?: string;          // "cf-email"
  CONTACT_TO?: string;
  CONTACT_FROM?: string;

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
  if (ct.includes("application/json")) {
    return (await request.json().catch(() => ({}))) as any;
  }
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
  const data = (await resp.json().catch(() => ({}))) as { success?: boolean };
  return !!data.success;
}

// ---- cf-email provider ----

async function sendWithCfEmail(env: Env, subject: string, text: string, replyTo?: string) {
  const url = env.EMAILER_URL?.trim();
  const token = env.EMAILER_TOKEN?.trim();
  const to = env.CONTACT_TO?.trim();
  const fromRaw = env.CONTACT_FROM?.trim();

  if (!url || !token || !to || !fromRaw) {
    throw new Error("Missing EMAILER_URL/EMAILER_TOKEN or CONTACT_TO/CONTACT_FROM");
  }

  const from = fromRaw.match(/<([^>]+)>/)?.[1] || fromRaw;

  const payload: Record<string, any> = {
    from,
    to,
    subject,
    text,
    html: text.replace(/\n/g, "<br>"),
  };
  if (replyTo) payload.replyTo = replyTo;

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", "x-email-token": token },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Email worker error: ${res.status} ${await res.text()}`);
}

// ---- Handler ----

export const onRequestPost = async (ctx: { request: Request; env: Env }) => {
  const { request, env } = ctx;

  try {
    const data = await parseBody(request);

    // Honeypot — bots tend to fill this
    if (data.website) {
      return new Response(JSON.stringify({ ok: true, dryRun: true, reason: "honeypot" }), { status: 200 });
    }

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

    if (provider && provider === "cf-email") {
      await sendWithCfEmail(env, subject, text, email);
    } else {
      // Dry-run or unknown provider
      return new Response(JSON.stringify({ ok: true, dryRun: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err?.message || "Internal error" }), { status: 500 });
  }
};
