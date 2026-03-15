// contactApi.js
const API_URL = "/api/contact"; // Relative path to Next.js API route

export async function sendContact(data) {
    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const text = await res.text();
        const json = text ? JSON.parse(text) : {};

        if (!res.ok) throw new Error(json?.error || "Failed to send message");

        return json;
    } catch (err) {
        console.error("sendContact error:", err);
        throw err;
    }
}