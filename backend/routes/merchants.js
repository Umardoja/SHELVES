const express = require("express");
const router = express.Router();
const Merchant = require("../models/Merchant");
const { authMiddleware } = require("../middleware/authMiddleware");

// @route   GET /api/merchants/me
// @desc    Get current user's merchant status
// @access  Private
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const merchant = await Merchant.findById(req.user.merchantId).select("businessName merchantCode roles");

        if (!merchant) {
            return res.json({ hasMerchant: false });
        }

        // Check if they are actually a merchant (has a code and isMerchant is true)
        const isMerchant = !!(merchant.merchantCode && merchant.roles?.isMerchant);

        if (isMerchant) {
            return res.json({
                hasMerchant: true,
                merchant: {
                    businessName: merchant.businessName,
                    merchantCode: merchant.merchantCode
                }
            });
        }

        res.json({ hasMerchant: false });
    } catch (err) {
        console.error("Merchant Status Error:", err.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// @route   GET /api/merchants/search
// @desc    Search merchants by business name
// @access  Public
router.get("/search", async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.json({ success: true, data: [] });
        }

        const merchants = await Merchant.find({
            businessName: { $regex: q, $options: "i" }
        }).select("businessName storeCode businessType phone");

        res.json({ success: true, data: merchants });
    } catch (err) {
        console.error("Merchant Search Error:", err.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

module.exports = router;
