// api/webhook.js
import fetch from "node-fetch";

const TELECRM_TOKEN = "YOUR_TOKEN";
const ENTERPRISE_ID = "YOUR_ENTERPRISE_ID";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const data = req.body;
    console.log("Received data from WebinarKit:", data);

    const name = data.first || "Unknown";
    const phone = (data.phoneCountryCode || "") + data.phone;
    const email = data.email || "";

    if (!phone) {
      return res.status(400).json({ error: "Phone number missing" });
    }

    const response = await fetch(`https://api.telecrm.in/enterprise/${ENTERPRISE_ID}/autoupdatelead`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TELECRM_TOKEN}`,
      },
      body: JSON.stringify({ fields: { name, phone, email, status: "Fresh" } }),
    });

    if (response.ok) {
      console.log(`✅ Lead synced: ${name} - ${phone}`);
      res.status(200).json({ success: true });
    } else {
      const errText = await response.text();
      console.error("❌ Error syncing lead:", errText);
      res.status(500).json({ error: errText });
    }
  } catch (err) {
    console.error("⚠️ Server error:", err);
    res.status(500).json({ error: err.message });
  }
}
