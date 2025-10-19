// functions/api/respond.ts
// POST /api/respond — sends via your existing Cloudflare Email Worker.

interface Env {
  // Reuse your contact vars (already configured in your screenshot)
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
  EMAILER_URL?: string;
  EMAILER_TOKEN?: string;
}

async function sendWithCfEmail(env: Env, subject: string, text: string, replyTo?: string) {
  if (!env.EMAILER_URL || !env.EMAILER_TOKEN) throw new Error("Missing EMAILER_URL/EMAILER_TOKEN");
  if (!env.CONTACT_TO || !env.CONTACT_FROM) throw new Error("Missing CONTACT_TO/CONTACT_FROM");

  const payload: Record<string, any> = {
    from: env.CONTACT_FROM,
    to: env.CONTACT_TO,
    subject,
    text,
  };
  if (replyTo) payload.replyTo = replyTo;

  const res = await fetch(env.EMAILER_URL, {
    method: "POST",
    headers: { "content-type": "application/json", "x-email-token": env.EMAILER_TOKEN },
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
