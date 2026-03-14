// src/api/contactApi.js

// Auto-switch between local dev (Spring Boot) and production (Vercel)
const API_URL =
    process.env.NODE_ENV === "development"
        ? "/api/contact" // React dev server proxy to Spring Boot
        : "https://yuriisuprun.vercel.app/api/contact";

export async function sendContact(data) {
    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            mode: "cors", // ensures CORS is handled in production
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => null);
            throw new Error(errorData?.error || "Failed to send message");
        }

        return res.json();
    } catch (err) {
        console.error("sendContact error:", err);
        throw err;
    }
}