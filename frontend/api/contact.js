const DEFAULT_BASE_URL = "https://yuriisuprun.onrender.com";
const MAX_BODY_SIZE = 1024 * 1024; // 1MB
const REQUEST_TIMEOUT_MS = 15000;

/**
 * Safely parse JSON
 */
function safeJsonParse(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Read raw request body with size limit
 */
function readRawBody(req, limit = MAX_BODY_SIZE) {
  return new Promise((resolve, reject) => {
    let totalSize = 0;
    const chunks = [];

    req.on("data", (chunk) => {
      totalSize += chunk.length;

      if (totalSize > limit) {
        req.destroy();
        return reject(new Error("Body too large"));
      }

      chunks.push(chunk);
    });

    req.on("end", () => {
      const body = Buffer.concat(chunks).toString("utf8");
      resolve(body);
    });

    req.on("error", reject);
  });
}

/**
 * Extract and normalize request body
 */
async function getRequestBody(req) {
  if (typeof req.body === "string") {
    return safeJsonParse(req.body);
  }

  if (req.body) {
    return req.body;
  }

  try {
    const raw = await readRawBody(req);
    return safeJsonParse(raw) || {};
  } catch {
    return {};
  }
}

/**
 * Send request to upstream contact API
 */
async function forwardToContactAPI(body, baseUrl) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const text = await response.text();
    const parsed = safeJsonParse(text);

    return {
      status: response.status,
      data:
          parsed && typeof parsed === "object"
              ? parsed
              : response.ok
                  ? { ok: true }
                  : { error: "Failed to send message" },
    };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // Allow only POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const baseUrl = process.env.CONTACT_BASE_URL || DEFAULT_BASE_URL;

  const body = await getRequestBody(req);

  // Honeypot spam protection
  if (body?.website) {
    return res.status(200).json({ ok: true });
  }

  try {
    const { status, data } = await forwardToContactAPI(body, baseUrl);
    return res.status(status).json(data);
  } catch (error) {
    console.error("Contact proxy error:", error);
    return res.status(500).json({ error: "Contact service unavailable" });
  }
};