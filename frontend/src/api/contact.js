export default async function handler(req, res) {
    const allowedOrigins = [
        "http://localhost:3000",            // local dev
        "https://yuriisuprun.vercel.app",  // production frontend
    ];

    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }

    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Respond to preflight requests
    if (req.method === "OPTIONS") return res.status(200).end();

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { name, email, message, website } = req.body;

        if (website) return res.status(200).json({ ok: true }); // honeypot
        if (!name || !email || !message)
            return res.status(400).json({ error: "All fields required" });

        console.log("Contact submission:", { name, email, message });

        // TODO: Send email via Nodemailer / SendGrid here

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error("Server error:", err);
        return res.status(500).json({ error: "Server error" });
    }
}