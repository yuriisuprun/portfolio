const API_URL = "/api/contact"; // Keep it relative, not full URL

export async function sendContact(data) {
    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const json = await res.json(); // safer than text + parse

        if (!res.ok) {
            throw new Error(json?.error || "Failed to send message");
        }

        return json;
    } catch (err) {
        console.error("sendContact error:", err);
        throw err;
    }
}