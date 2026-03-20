const DEFAULT_BASE_URL = "https://yuriisuprun.onrender.com";

const safeJsonParse = (text) => {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
};

const readRawBody = (req, limit = 1024 * 1024) =>
    new Promise((resolve, reject) => {
      let total = 0;
      const chunks = [];

      req.on("data", (chunk) => {
        total += chunk.length;
        if (total > limit) {
          req.destroy();
          return reject(new Error("Body too large"));
        }
        chunks.push(chunk);
      });

      req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      req.on("error", reject);
    });

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const baseUrl = process.env.CONTACT_BASE_URL || DEFAULT_BASE_URL;

  let body =
      typeof req.body === "string"
          ? safeJsonParse(req.body)
          : req.body;

  if (!body) {
    const raw = await readRawBody(req).catch(() => "");
    body = safeJsonParse(raw) || {};
  }

  if (body?.website) return res.status(200).json({ ok: true });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const r = await fetch(`${baseUrl}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    const text = await r.text();
    const parsed = safeJsonParse(text);

    return res
        .status(r.status)
        .json(parsed && typeof parsed === "object" ? parsed : r.ok ? { ok: true } : { error: "Failed to send message" });

  } catch (e) {
    console.error("Contact proxy error:", e);
    return res.status(500).json({ error: "Contact service unavailable" });
  }
};