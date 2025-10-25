// api/webhook.js
import fetch from "node-fetch";

const TELECRM_TOKEN = "49435e22-c8a8-4023-93fe-8c3160b9b9281761398307986:179ae4d6-8115-4ef4-b5af-9562254d7db8";
const ENTERPRISE_ID = "6402fe9688c27c000736d999";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const data = req.body;
    console.log("Received data from WebinarKit:", data);

    // WebinarKit registration fields mapping
    const firstName = data.first || data.first_name || "";
    const lastName = data.last || data.last_name || "";
    const name = `${firstName} ${lastName}`.trim() || "Unknown";

    // Phone number (required)
    let phone = data.phone || data.phone_number || "";
    if (phone && !phone.startsWith("+")) {
      phone = "+91" + phone.replace(/\D/g, ""); // default India code
    }

    if (!phone) {
      console.warn("⚠️ Phone number missing. Skipping lead.");
      return res.status(400).json({ error: "Phone number is required" });
    }

    // TeleCRM payload (using exact API names from dashboard)
    const payload = {
      fields: {
        name: name,   // Name field in CRM
        phone: phone, // Phone field in CRM
        status: "Fresh"
      },
      actions: [{}]
    };

    // Send lead to TeleCRM Async API
    const response = await fetch(`https://api.telecrm.in/enterprise/${ENTERPRISE_ID}/autoupdatelead`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TELECRM_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log(`✅ Lead synced: ${name} - ${phone}`);
      res.status(200).json({ success: true, lead: { name, phone } });
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
