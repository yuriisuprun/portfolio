const BASE_URL = "https://yuriisuprun.onrender.com"; // Spring backend

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

        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (err) {
        console.error("Contact proxy error:", err);
        return res.status(500).json({ error: "Contact service unavailable" });
    }
}