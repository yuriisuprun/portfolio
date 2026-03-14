// src/api/contactApi.js
export async function sendContact(data) {
    try {
        const res = await fetch("https://yuriisuprun.vercel.app/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            mode: "cors",
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