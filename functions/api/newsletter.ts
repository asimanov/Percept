// POST /api/newsletter

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function parseBody(request: Request): Promise<Record<string, any>> {
  const ct = request.headers.get("content-type") || "";

  if (ct.includes("application/json")) {
    const json = await request.json().catch(() => ({}));
    return (json && typeof json === "object") ? (json as Record<string, any>) : {};
  }

  if (ct.includes("form")) {
    const fd = await request.formData();
    const o: Record<string, any> = {};
    for (const [k, v] of fd.entries()) {
      o[k] = typeof v === "string" ? v : v.name;
    }
    return o;
  }

  return {};
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
}

export const onRequestPost = async (ctx: { request: Request }): Promise<Response> => {
  const { request } = ctx;

  const body = await parseBody(request);
  const email = (body.email || "").toString().trim();

  if (!isValidEmail(email)) {
    return jsonResponse({ ok: false, error: "Valid email required" }, 400);
  }

  // Percept Index on Substack (no env required)
  const publication = "perceptindex";
  const target = `https://${publication}.substack.com/welcome?email=${encodeURIComponent(email)}`;

  return new Response(null, {
    status: 303,
    headers: {
      Location: target,
    },
  });
};
