export async function sendContact(data) {

    const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        throw new Error("Failed");
    }
}