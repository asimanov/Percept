// POST /api/newsletter — Dry-run by default.

export interface Env {
  BUTTONDOWN_API_KEY?: string;
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

export const onRequestPost = async (ctx: { request: Request; env: Env }) => {
  const { request, env } = ctx;

  try {
    const body = await parseBody(request);
    const email = (body.email || "").toString().trim();

    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({ ok: false, error: "Valid email required" }), { status: 400 });
    }

    // Dry-run if no API key configured
    if (!env.BUTTONDOWN_API_KEY) {
      return new Response(JSON.stringify({ ok: true, dryRun: true }), { status: 200 });
    }

    const res = await fetch("https://api.buttondown.email/v1/subscribers", {
      method: "POST",
      headers: {
        Authorization: `Token ${env.BUTTONDOWN_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ ok: false, error: `Buttondown error: ${res.status} ${await res.text()}` }),
        { status: res.status }
      );
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err?.message || "Internal error" }), { status: 500 });
  }
};
