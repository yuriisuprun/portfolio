const API_URL =
    process.env.NODE_ENV === "development"
        ? "http://localhost:8080/api/contact"
        : "https://portfolio.onrender.com/api/contact";

export async function sendContact(data) {
    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (res.status === 204) return {};

        const text = await res.text();
        const json = text ? JSON.parse(text) : {};

        if (!res.ok) {
            throw new Error(json?.error || "Failed to send message");
        }

        return json;
    } catch (err) {
        console.error("sendContact error:", err);
        throw err;
    }
}
