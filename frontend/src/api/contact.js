const BASE_URL = "https://yuriisuprun.onrender.com"; // your Spring backend

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const response = await fetch(`${BASE_URL}/api/contact`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req.body),
        });

        const text = await response.text();
        const data = text ? JSON.parse(text) : {};

        return res.status(response.status).json(data);
    } catch (err) {
        console.error("Contact proxy error:", err);
        return res.status(500).json({ error: "Contact service unavailable" });
    }
}