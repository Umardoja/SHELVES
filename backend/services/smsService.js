require("dotenv").config();

// ─── Lazy-initialised AT client ───────────────────────────────────────────────
// We do NOT call AfricasTalking() at module load time because on Render the
// env vars are injected before the process starts, but calling the constructor
// with undefined values throws immediately and crashes the whole server.
// Instead we build the client the first time sendSMS() is actually called.

let _sms = null;

function getSMS() {
  if (_sms) return _sms;

  const API_KEY = process.env.AT_API_KEY;
  const USERNAME = process.env.AT_USERNAME;

  if (!API_KEY || !USERNAME) {
    throw new Error(
      "AT_API_KEY or AT_USERNAME environment variable is not set. " +
      "Please add them in your Render service Environment settings."
    );
  }

  const AfricasTalking = require("africastalking");
  const at = AfricasTalking({ apiKey: API_KEY, username: USERNAME });
  _sms = at.SMS;
  return _sms;
}

// ─── Phone normalisation ──────────────────────────────────────────────────────
// Africa's Talking requires international format WITH '+' (e.g. +2349028530184)
function normalizePhoneNumber(phone) {
  if (!phone) return null;

  let s = phone.trim().replace(/[^\d+]/g, "");

  if (s.startsWith("+234")) return s;
  if (s.startsWith("234")) return "+" + s;
  if (s.startsWith("0")) return "+234" + s.substring(1);

  return s.startsWith("+") ? s : "+" + s;
}

// ─── Message splitting ────────────────────────────────────────────────────────
function splitMessage(message, maxLength = 160) {
  if (!message) return [];
  const parts = [];
  let current = "";

  message.split(" ").forEach((word) => {
    if ((current + word).length > maxLength) {
      if (current.trim()) { parts.push(current.trim()); current = ""; }
      if (word.length > maxLength) { parts.push(word); return; }
    }
    current += word + " ";
  });

  if (current.trim()) parts.push(current.trim());
  return parts;
}

// ─── Send SMS ─────────────────────────────────────────────────────────────────
async function sendSMS(phoneNumber, message) {
  try {
    // Normalise recipients
    let normalizedPhones = [];
    if (Array.isArray(phoneNumber)) {
      normalizedPhones = phoneNumber.map(normalizePhoneNumber).filter(Boolean);
    } else {
      const n = normalizePhoneNumber(phoneNumber);
      if (n) normalizedPhones.push(n);
    }

    if (normalizedPhones.length === 0) {
      throw new Error("No valid phone numbers provided");
    }

    console.log("[SMS] Sending to:", normalizedPhones);

    const sms = getSMS(); // lazy-init — throws clearly if creds missing
    const SENDER_ID = process.env.AT_SENDER_ID || "ATAlert";
    const parts = splitMessage(message, 160);
    const results = [];

    for (const part of parts) {
      try {
        const payload = {
          to: normalizedPhones,
          message: part,
          from: SENDER_ID
        };

        console.log("[SMS] Sending Payload:", JSON.stringify(payload));

        const response = await sms.send(payload);

        // Log full response for debugging as requested
        console.log("[SMS] Full Response from Africa's Talking:", JSON.stringify(response, null, 2));

        const recipients = response?.SMSMessageData?.Recipients || [];
        for (const r of recipients) {
          if (r.status !== "Success") {
            console.error(`[SMS FAILED]    Number: ${r.number} | Status: ${r.status} | Error: ${r.errorMessage || 'No specific error message'}`);
          } else {
            console.log(`[SMS DELIVERED] Number: ${r.number} | MessageId: ${r.messageId} | Status: ${r.status}`);
          }
        }

        results.push(response);
      } catch (partErr) {
        console.error("[SMS Part Error - Full Details]:", partErr);
        if (partErr.response) {
          console.error("[SMS Provider Response]:", partErr.response.data || partErr.response);
        }
      }
    }

    return results;
  } catch (error) {
    console.error("[SMS Fatal Error]:", error);
    return null;
  }
}

module.exports = { sendSMS, normalizePhoneNumber, splitMessage };
