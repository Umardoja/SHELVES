const express = require("express");
const router = express.Router();
const Merchant = require("../models/Merchant");
const { authMiddleware } = require("../middleware/authMiddleware");

// @route   PUT /api/user/preferences
// @desc    Update user preferences (generic handler)
// @access  Private
router.put("/preferences", authMiddleware, async (req, res) => {
    try {
        console.log(`[userPreferences] handler entered for merchantId=${req.user?.merchantId}`);
        const { notifications, darkMode, ...otherPrefs } = req.body;

        const merchant = await Merchant.findById(req.user.merchantId);
        if (!merchant) {
            return res.status(404).json({ success: false, message: "Merchant not found" });
        }

        // Update notifications if provided
        if (notifications) {
            merchant.preferences = merchant.preferences || {};
            merchant.preferences.notifications = merchant.preferences.notifications || {};
            if (notifications.sms !== undefined) merchant.preferences.notifications.sms = notifications.sms;
            if (notifications.email !== undefined) merchant.preferences.notifications.email = notifications.email;
            if (notifications.app !== undefined) merchant.preferences.notifications.app = notifications.app;
        }

        // Update darkMode or other top-level preference fields
        if (darkMode !== undefined) {
            merchant.preferences = merchant.preferences || {};
            merchant.preferences.darkMode = darkMode;
        }

        // Merge any other preference fields provided
        if (otherPrefs && Object.keys(otherPrefs).length > 0) {
            merchant.preferences = merchant.preferences || {};
            for (const key of Object.keys(otherPrefs)) {
                merchant.preferences[key] = otherPrefs[key];
            }
        }

        await merchant.save();

        return res.status(200).json({
            success: true,
            preferences: merchant.preferences
        });
    } catch (err) {
        console.error("Error updating preferences:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
