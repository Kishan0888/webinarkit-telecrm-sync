import fetch from "node-fetch";

const TELECRM_TOKEN = "49435e22-c8a8-4023-93fe-8c3160b9b9281761398307986:179ae4d6-8115-4ef4-b5af-9562254d7db8";
const ENTERPRISE_ID = "6402fe9688c27c000736d999";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const data = req.body;
    console.log("📩 Received data from WebinarKit:", data);

    // Mapping WebinarKit fields to TeleCRM fields
    const name = `${data.first || ""} ${data.last || ""}`.trim() || "Unknown";
    const phone = `${data.phoneCountryCode || "+91"} ${data.phone || ""}`.trim();
    
    // Status mandatory for TeleCRM
    const status = "Just Curious"; // Initial stage in TeleCRM

    const payload = {
      fields: {
        name,
        phone,
        status
      },
      actions: [{}] // required by TeleCRM Async API
    };

    // Call TeleCRM Async API
    const response = await fetch(
      `https://api.telecrm.in/enterprise/${ENTERPRISE_ID}/autoupdatelead`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TELECRM_TOKEN}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (response.ok) {
      console.log(`✅ Lead synced: ${name} - ${phone}`);
      return res.status(200).json({ success: true });
    } else {
      const errText = await response.text();
      console.error("❌ Error syncing lead:", errText);
      return res.status(500).json({ error: errText });
    }

  } catch (err) {
    console.error("⚠️ Server error:", err);
    return res.status(500).json({ error: err.message });
  }
}
