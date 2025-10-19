// functions/api/respond.ts
// POST /api/respond — sends via your existing Cloudflare Email Worker.

interface Env {
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
  EMAILER_URL?: string;
  EMAILER_TOKEN?: string;
}

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

export const onRequestPost = async (ctx: { request: Request; env: Env }) => {
  const { request, env } = ctx;

  const form = await request.formData().catch(() => null);
  if (!form) return new Response("Bad Request", { status: 400 });

  // Honeypot
  if (String(form.get("website") || "").trim() !== "") {
    return new Response(null, { status: 204 });
  }

  const message = String(form.get("message") || "").trim();
  if (!message) {
    return new Response(JSON.stringify({ ok: false, error: "Message required" }), { status: 400 });
  }

  const name         = String(form.get("name") || "").trim();
  const email        = String(form.get("email") || "").trim();
  const allowPublish = String(form.get("allowPublish") || "").toLowerCase() === "yes";
  const entryTitle   = String(form.get("entryTitle") || "").trim();
  const entryUrl     = String(form.get("entryUrl") || "").trim();
  const entryId      = String(form.get("entryId") || "").trim();

  const subject = `Percept Response: ${entryTitle || "Untitled entry"}`;
  const text = [
    `Entry: ${entryTitle}`,
    `URL:   ${entryUrl}`,
    entryId ? `ID:    ${entryId}` : null,
    "",
    `From:  ${name || "Anonymous"}${email ? ` <${email}>` : ""}`,
    `OK to publish excerpts: ${allowPublish ? "Yes" : "No"}`,
    "",
    "Message:",
    message,
  ].filter(Boolean).join("\n");

  try {
    await sendWithCfEmail(env, subject, text, email || undefined);
    const redirectTo = entryUrl || "/";
    return Response.redirect(`${redirectTo}#response-sent`, 303);
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || "Send failed" }), { status: 500 });
  }
};
