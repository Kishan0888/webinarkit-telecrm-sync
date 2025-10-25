// api/webhook.js
import fetch from "node-fetch";

const TELECRM_TOKEN = "49435e22-c8a8-4023-93fe-8c3160b9b9281761398307986:179ae4d6-8115-4ef4-b5af-9562254d7db8";
const ENTERPRISE_ID = "6402fe9688c27c000736d999";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const data = req.body;
    console.log("Received data from WebinarKit:", data);

    // WebinarKit payload me registration object
    const registration = data.registration || {};

    const name = registration.first_name || registration.full_name || "Unknown";
    const phone = registration.phone || registration.phone_number || "";

    if (!phone) {
      return res.status(400).json({ error: "Phone number missing" });
    }

    // TeleCRM API call
    const response = await fetch(`https://api.telecrm.in/enterprise/${ENTERPRISE_ID}/autoupdatelead`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TELECRM_TOKEN}`,
      },
      body: JSON.stringify({ fields: { name, phone, status: "Fresh" } }),
    });

    if (response.ok) {
      console.log(`✅ Lead synced successfully: ${name} - ${phone}`);
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
