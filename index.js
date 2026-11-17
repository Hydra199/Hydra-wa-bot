
const express = require("express");
require("dotenv").config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Send WhatsApp message
async function sendMessage(to, message) {
  const url = `https://graph.facebook.com/${process.env.GRAPH_API_VERSION}/` +
    `${process.env.PHONE_NUMBER_ID}/messages`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: message }
      })
    });

    const data = await response.json();
    console.log("WhatsApp response:", data);
  } catch (error) {
    console.error("Message error:", error);
  }
}

// Verify webhook
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (
    mode === "subscribe" &&
    token === process.env.VERIFY_TOKEN
  ) {
    return res.status(200).send(challenge);
  }

  res.sendStatus(403);
});

// Receive WhatsApp messages
app.post("/webhook", async (req, res) => {
  res.sendStatus(200);

  try {
    const messages =
      req.body.entry?.[0]?.changes?.[0]?.value?.messages;

    if (!messages) return;

    for (const msg of messages) {
      if (msg.type !== "text") continue;

      const sender = msg.from;
      const text = msg.text.body.trim().toLowerCase();

      let reply;

      if (text === "hi" || text === "hello") {
        reply = "Hello bro! Welcome to Hydra WA Bot 🔥";
      } else if (text === ".menu" || text === "menu") {
        reply = `🤖 HYDRA WA BOT

.menu - Show menu
.help - Help
.ping - Check bot
.time - Current server time
.about - About bot`;
      } else if (text === ".help") {
        reply = "Need help? Type .menu to see all commands.";
      } else if (text === ".ping") {
        reply = "Pong! 🏓 Hydra bot is alive!";
      } else if (text === ".time") {
        reply = "Server time: " + new Date().toLocaleString();
      } else if (text === ".about") {
        reply = "Hydra WA Bot - Your All-in-One WhatsApp Assistant 🚀";
      } else {
        reply = "I didn't understand that. Type .menu to see commands.";
      }

      await sendMessage(sender, reply);
    }
  } catch (error) {
    console.error("Webhook error:", error);
  }
});

app.get("/", (req, res) => {
  res.send("Hydra WA Bot is running! 🤖");
});

app.listen(PORT, () => {
  console.log(`Hydra WA Bot running on port ${PORT}`);
});

