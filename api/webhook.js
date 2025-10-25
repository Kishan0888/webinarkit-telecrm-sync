// api/webhook.js
import fetch from "node-fetch";

const TELECRM_TOKEN = "49435e22-c8a8-4023-93fe-8c3160b9b9281761398307986:179ae4d6-8115-4ef4-b5af-9562254d7db8";
const ENTERPRISE_ID = "6402fe9688c27c000736d999";

// Mandatory status for Initial Stage
const INITIAL_STATUS = "Just Curious";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const data = req.body;
    console.log("Received data from WebinarKit:", data);

    // WebinarKit payload keys (adjust if different)
    const name = data.first || data.full_name || "Unknown";
    let phone = data.phone || data.phone_number || "";

    // Add country code if missing
    if (phone && !phone.startsWith("+")) {
      phone = "+91" + phone;
    }

    // TeleCRM API call
    const response = await fetch(`https://api.telecrm.in/enterprise/${ENTERPRISE_ID}/autoupdatelead`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TELECRM_TOKEN}`,
      },
      body: JSON.stringify({
        fields: {
          name,
          phone,
          status: INITIAL_STATUS
        },
        actions: [{}]
      }),
    });

    const respText = await response.text();

    if (response.ok) {
      console.log(`✅ Lead synced successfully to TeleCRM: ${name} - ${phone} - Status: ${INITIAL_STATUS}`);
      res.status(200).json({ success: true, message: respText });
    } else {
      console.error("❌ Error syncing lead:", respText);
      res.status(response.status).json({ error: respText });
    }
  } catch (err) {
    console.error("⚠️ Server error:", err);
    res.status(500).json({ error: err.message });
  }
}
