// server.js
import express from "express";
import nodemailer from "nodemailer";
import bodyParser from "body-parser";
import cors from "cors";
import twilio from "twilio";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// -------------------- EMAIL SETUP --------------------
const transporter = nodemailer.createTransport({
  host: "smtp.yourprovider.com",   // e.g., smtp.gmail.com
  port: 587,
  secure: false,
  auth: {
    user: "your@email.com",
    pass: "yourpassword"
  }
});

// -------------------- SMS SETUP (Twilio) --------------------
const twilioClient = twilio("TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN");
const smsFrom = "+1234567890"; // your Twilio number

// -------------------- API: Send Campaign --------------------
app.post("/send-campaign", async (req, res) => {
  const { subject, html, recipients, type, smsBody } = req.body;

  try {
    if (type === "email") {
      // loop all recipients for email
      for (const email of recipients) {
        await transporter.sendMail({
          from: '"Your Brand" <your@email.com>',
          to: email,
          subject,
          html
        });
      }
      return res.json({ success: true, sent: recipients.length, mode: "email" });
    } 
    else if (type === "sms") {
      // loop all recipients for sms
      for (const number of recipients) {
        await twilioClient.messages.create({
          body: smsBody,
          from: smsFrom,
          to: number
        });
      }
      return res.json({ success: true, sent: recipients.length, mode: "sms" });
    } 
    else {
      return res.status(400).json({ success: false, error: "Invalid type" });
    }
  } catch (err) {
    console.error("Send failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));
