const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");
const { authMiddleware } = require("../middleware/authMiddleware");

// @route   GET /api/contacts
// @desc    Get all contacts for a merchant
// @access  Private
router.get("/", authMiddleware, async (req, res) => {
    try {
        const contacts = await Contact.find({ merchantId: req.user.merchantId }).sort({ lastOrderDate: -1 });
        res.json(contacts);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error" });
    }
});

// @route   POST /api/contacts
// @desc    Add a new contact
// @access  Private
router.post("/", authMiddleware, async (req, res) => {
    const { phone, name } = req.body;
    const { normalizePhoneNumber, toLocalPhone } = require("../utils/phone");

    if (!phone) {
        return res.status(400).json({ message: "Phone number is required" });
    }

    const localFormat = toLocalPhone(phone);
    const e164Format = normalizePhoneNumber(phone);

    if (!localFormat) {
        return res.status(400).json({ message: "Invalid phone number format" });
    }

    try {
        // Prevent duplicate contacts
        const existing = await Contact.findOne({
            merchantId: req.user.merchantId,
            phone: { $in: [localFormat, e164Format] }
        });

        if (existing) {
            return res.status(400).json({ message: "Contact already exists" });
        }

        const newContact = new Contact({
            merchantId: req.user.merchantId,
            phone: localFormat,
            name
        });

        const contact = await newContact.save();
        res.json(contact);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
