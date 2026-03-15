export default async function handler(req, res) {
    try {
        const response = await fetch(
            "https://yuriisuprun.onrender.com/api/repos"
        );

        const text = await response.text();
        const data = text ? JSON.parse(text) : [];

        return res.status(200).json(data);
    } catch (err) {
        console.error("Repos proxy error:", err);
        return res.status(500).json({ error: "Failed to fetch repositories" });
    }
}