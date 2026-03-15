// Vercel Serverless Function: handles POST /api/contact
// This project is CRA; in production there is no backend unless we define an `/api/*` function at repo root.

const DEFAULT_BASE_URL = "https://yuriisuprun.onrender.com";

function safeJsonParse(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function readRawBody(req, { limitBytes = 1024 * 1024 } = {}) {
  return new Promise((resolve, reject) => {
    let total = 0;
    const chunks = [];

    req.on("data", (chunk) => {
      total += chunk.length;
      if (total > limitBytes) {
        reject(new Error("Request body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

module.exports = async (req, res) => {
  // Allow preflight in case the frontend is hosted on a different origin in the future.
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const baseUrl = process.env.CONTACT_BASE_URL || DEFAULT_BASE_URL;

  // Vercel usually parses JSON into req.body. Be defensive in case it's a string.
  let body = req.body;
  if (typeof body === "string") {
    body = safeJsonParse(body) ?? {};
  }
  if (body == null) {
    const raw = await readRawBody(req).catch(() => "");
    body = safeJsonParse(raw) ?? {};
  }

  // Honeypot field used by the frontend form.
  if (body && typeof body === "object" && body.website) {
    // Pretend success to reduce bot retries/spam.
    return res.status(200).json({ ok: true });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`${baseUrl}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    const text = await response.text();
    const parsed = safeJsonParse(text);

    // Preserve backend status. If backend didn't return JSON, wrap it.
    if (parsed && typeof parsed === "object") {
      return res.status(response.status).json(parsed);
    }

    if (response.ok) {
      return res.status(response.status).json({ ok: true });
    }

    return res
      .status(response.status)
      .json({ error: "Failed to send message" });
  } catch (err) {
    console.error("Contact proxy error:", err);
    return res.status(500).json({ error: "Contact service unavailable" });
  }
};
