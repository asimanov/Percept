import { EmailMessage } from "cloudflare:email";

export default {
  async fetch(request, env) {
    if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

    const { from, to, subject, text } = await request.json().catch(() => ({}));
    if (!from || !to || !subject || !text) return new Response("Bad Request", { status: 400 });

    const raw = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=UTF-8",
      "",
      text
    ].join("\r\n");

    const msg = new EmailMessage(from, to, raw);
    await env.SEB.send(msg);   // SEB matches wrangler.toml binding

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  }
};
