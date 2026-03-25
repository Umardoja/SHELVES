const express = require("express");
const router = express.Router();

const smsService = require("../services/smsService");
const Contact = require("../models/Contact");
const Campaign = require("../models/Campaign");
const Merchant = require("../models/Merchant");
const { authMiddleware } = require("../middleware/authMiddleware");


// @route   POST /api/sms
// @desc    Send promo SMS to contacts
// @access  Private
router.post("/", authMiddleware, async (req, res) => {
  const { contactIds, sendToAll, message } = req.body;
  const merchantId = req.user.merchantId;

  try {
    let contacts = [];

    if (sendToAll) {
      contacts = await Contact.find({ merchantId });
    } else if (contactIds && Array.isArray(contactIds)) {
      contacts = await Contact.find({ _id: { $in: contactIds }, merchantId });
    }

    if (contacts.length === 0) {
      return res.status(400).json({ success: false, message: "No recipients found" });
    }

    const numbers = contacts.map(c => c.phone);
    const recipientsCount = numbers.length;

    // Check SMS Balance
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      return res.status(404).json({ success: false, message: "Merchant not found" });
    }

    const freeRemaining = Math.max(0, (merchant.smsFreeMonthly || 0) - (merchant.smsUsedThisMonth || 0));
    const totalAvailable = freeRemaining + (merchant.smsCredits || 0);

    if (recipientsCount > totalAvailable) {
      return res.status(400).json({
        success: false,
        message: "Insufficient SMS Credits. Please purchase more.",
        available: totalAvailable,
        required: recipientsCount
      });
    }

    // Africa's Talking expects an array of numbers
    await smsService.sendSMS(numbers, message);

    // Deduct Credits
    let usedThisTime = recipientsCount;

    // Deduct from free monthly first
    const fromFree = Math.min(usedThisTime, freeRemaining);
    merchant.smsUsedThisMonth = (merchant.smsUsedThisMonth || 0) + fromFree;
    usedThisTime -= fromFree;

    // Deduct remainder from purchased credits
    if (usedThisTime > 0) {
      merchant.smsCredits = Math.max(0, (merchant.smsCredits || 0) - usedThisTime);
    }

    await merchant.save();

    // Track the successful campaign
    await Campaign.create({
      merchantId,
      message,
      recipientsCount: numbers.length,
      status: "SENT"
    });

    res.json({ success: true, message: `Message sent to ${numbers.length} contacts` });
  } catch (err) {
    console.error("SMS Broadcast Error:", err.message);
    res.status(500).json({ success: false, message: "Failed to send SMS" });
  }
});

// LEGACY (Incoming SMS trigger - keeping as fallback if needed but USSD/Dashboard is primary)
router.post("/incoming", (req, res) => {
  const from = req.body.from;
  const text = req.body.text.toLowerCase();
  // ... rest of logic for generic auto-reply if needed
  res.send("OK");
});

// @route   GET /api/sms/campaigns
// @desc    Get recent campaigns for a merchant
// @access  Private
router.get("/campaigns", authMiddleware, async (req, res) => {
  try {
    const campaigns = await Campaign.find({ merchantId: req.user.merchantId })
      .sort({ dateSent: -1 })
      .limit(10);
    res.json(campaigns);
  } catch (err) {
    console.error("Fetch Campaigns Error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch campaigns" });
  }
});

module.exports = router;
