// src/api/contactApi.js

const API_URL =
    process.env.NODE_ENV === "development"
        ? "/api/contact"
        : "https://yuriisuprun.vercel.app/api/contact";

export async function sendContact(data) {
    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            mode: "cors",
        });

        // If response is 204 No Content, just return empty object
        if (res.status === 204) return {};

        // Only parse JSON if there is content
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