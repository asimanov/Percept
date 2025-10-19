// functions/api/respond.ts
// Cloudflare Pages Function for POST /api/respond
// Uses SendGrid if keys are present; otherwise dry-run.

interface Env {
  SENDGRID_API_KEY?: string;
  FEEDBACK_TO?: string;
  FEEDBACK_FROM?: string;
}

async function sendEmail(env: Env, subject: string, text: string, replyTo?: string) {
  if (!env.SENDGRID_API_KEY || !env.FEEDBACK_TO || !env.FEEDBACK_FROM) {
    // No provider configured: accept but don't send
    return { dryRun: true };
  }

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: env.FEEDBACK_TO }] }],
      from: { email: env.FEEDBACK_FROM, name: "Percept Index" },
      reply_to: replyTo ? { email: replyTo } : undefined,
      subject,
      content: [{ type: "text/plain", value: text }],
    }),
  });
  if (!res.ok) throw new Error(`SendGrid error: ${res.status}`);
  return { dryRun: false };
}

export const onRequestPost = async (ctx: { request: Request; env: Env }) => {
  const { request, env } = ctx;

  // Parse form fields
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

  const entryTitle = String(form.get("entryTitle") || "").trim();
  const entryUrl   = String(form.get("entryUrl") || "").trim();
  const entryId    = String(form.get("entryId") || "").trim();

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
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await sendEmail(env, subject, text, email || undefined);

    // Redirect back to the entry with success anchor
    // If entryUrl is missing, fall back to homepage
    const redirectTo = entryUrl || "/";
    return Response.redirect(`${redirectTo}#response-sent`, 303);
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: "Send failed" }), { status: 500 });
  }
};
