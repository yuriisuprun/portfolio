export default async function handler(req, res) {
    const allowedOrigins = [
        "http://localhost:3000",
        "https://yuriisuprun.vercel.app",
    ];

    const origin = req.headers.origin;
    const allowOrigin = allowedOrigins.includes(origin) ? origin : "";

    res.setHeader("Access-Control-Allow-Origin", allowOrigin);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { name, email, message, website } = req.body;
        
        if (website) return res.status(200).json({ ok: true });

        if (!name || !email || !message)
            return res.status(400).json({ error: "All fields required" });

        console.log("Contact submission:", { name, email, message });

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error("Server error:", err);
        return res.status(500).json({ error: "Server error" });
    }
}