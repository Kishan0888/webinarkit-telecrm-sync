// api/webhook.js
import fetch from "node-fetch";

const TELECRM_TOKEN = "49435e22-c8a8-4023-93fe-8c3160b9b9281761398307986:179ae4d6-8115-4ef4-b5af-9562254d7db8";
const ENTERPRISE_ID = "6402fe9688c27c000736d999";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const data = req.body;
    console.log("Received data from WebinarKit:", JSON.stringify(data, null, 2));

    // Map WebinarKit registration fields
    const firstName = data.first || "";
    const lastName = data.last || "";
    const name = (firstName + " " + lastName).trim() || "Unknown";

    const phone = (data.phoneCountryCode || "") + (data.phone || "");
    const email = data.email || undefined;

    if (!phone) {
      return res.status(400).json({ error: "Phone number missing" });
    }

    // TeleCRM API payload using exact API field names
    const telecrmPayload = {
      fields: {
        full_name: name,
        phone_number: phone,
        email: email,
        status: "Fresh",
      },
    };

    const response = await fetch(
      `https://api.telecrm.in/enterprise/${ENTERPRISE_ID}/autoupdatelead`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TELECRM_TOKEN}`,
        },
        body: JSON.stringify(telecrmPayload),
      }
    );

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
