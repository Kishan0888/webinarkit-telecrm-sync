import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// TeleCRM credentials
const TELECRM_TOKEN = "49435e22-c8a8-4023-93fe-8c3160b9b9281761398307986:179ae4d6-8115-4ef4-b5af-9562254d7db8";
const ENTERPRISE_ID = "6402fe9688c27c000736d999";

// Webhook endpoint to receive WebinarKit registrations
app.post("/webinarkit-to-telecrm", async (req, res) => {
  try {
    const data = req.body;
    console.log("Received data from WebinarKit:", data);

    // Adjust keys according to WebinarKit payload structure
    const name = data.name || data.full_name || "Unknown";
    const phone = data.phone || data.phone_number;

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
          status: "Fresh",
        },
      }),
    });

    if (response.ok) {
      console.log("✅ Lead synced successfully to TeleCRM");
      res.status(200).send("Lead synced successfully");
    } else {
      const errorText = await response.text();
      console.error("❌ Error syncing lead:", errorText);
      res.status(500).send("Error syncing lead");
    }
  } catch (err) {
    console.error("⚠️ Server error:", err);
    res.status(500).send("Server error");
  }
});

// Start server
app.listen(3000, () => console.log("🚀 Webhook running on port 3000"));
