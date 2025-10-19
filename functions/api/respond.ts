// functions/api/respond.ts
import type { APIRoute } from 'astro';

async function sendEmail({ subject, text, replyTo }: { subject: string; text: string; replyTo?: string }) {
  const apiKey = import.meta.env.SENDGRID_API_KEY;              // already used in your project
  const to     = import.meta.env.FEEDBACK_TO;                   // your inbox
  const from   = import.meta.env.FEEDBACK_FROM || "noreply@perceptindex.com";

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: from, name: "Percept Index" },
      reply_to: replyTo ? { email: replyTo } : undefined,
      subject,
      content: [{ type: "text/plain", value: text }]
    })
  });
  if (!res.ok) throw new Error(`SendGrid error: ${res.status}`);
}

export const prerender = false;
export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();

  // Honeypot
  if (String(form.get("website") || "").trim() !== "") return new Response(null, { status: 204 });

  const message = String(form.get("message") || "").trim();
  if (!message) return new Response(JSON.stringify({ ok:false, error:"Message required" }), { status: 400 });

  const name         = String(form.get("name") || "").trim();
  const email        = String(form.get("email") || "").trim();
  const allowPublish = String(form.get("allowPublish") || "").toLowerCase() === "yes";
  const entryTitle   = String(form.get("entryTitle") || "").trim();
  const entryUrl     = String(form.get("entryUrl") || "").trim();
  const entryId      = String(form.get("entryId") || "").trim();

  // Simple in-memory rate limit: 3 per 10min per IP (swap to KV later if needed)
  const ip = request.headers.get("cf-connecting-ip") || "0.0.0.0";
  (globalThis as any).__rl ??= new Map<string, number[]>();
  const bucket = (globalThis as any).__rl as Map<string, number[]>;
  const now = Date.now(), windowMs = 10*60*1000;
  const arr = (bucket.get(ip) || []).filter(ts => now - ts < windowMs);
  if (arr.length >= 3) return new Response(JSON.stringify({ ok:false, error:"Rate limited" }), { status: 429 });
  arr.push(now); bucket.set(ip, arr);

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
    message
  ].filter(Boolean).join("\n");

  try {
    await sendEmail({ subject, text, replyTo: email || undefined });
    return Response.redirect(`${entryUrl}#response-sent`, 303);
  } catch {
    return new Response(JSON.stringify({ ok:false, error:"Send failed" }), { status: 500 });
  }
};
