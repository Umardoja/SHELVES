const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Merchant = require("../models/Merchant");
const { authMiddleware } = require("../middleware/authMiddleware");
const { generateStoreCode } = require("../services/database");

// @route   GET /api/user/public/merchants
// @desc    Get all merchants (public)
// @access  Public
router.get("/public/merchants", async (req, res) => {
    try {
        const merchants = await Merchant.find({}).select("businessName storeCode businessType phone");
        res.json({ success: true, data: merchants });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// @route   GET /api/user/profile
// @desc    Get current user profile
// @access  Private
router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const merchant = await Merchant.findById(req.user.merchantId).select("-password -otp -otpExpiry");
        if (!merchant) {
            return res.status(404).json({ message: "Merchant not found" });
        }

        // Failsafe: Generate storeCode if somehow missing for legacy merchants
        if (!merchant.storeCode) {
            const newCode = await generateStoreCode(merchant.businessName);
            merchant.storeCode = newCode;
            await merchant.save();
        }

        // Monthly SMS Credit Reset Logic
        const now = new Date();
        const lastReset = new Date(merchant.lastCreditReset || 0);
        const isNewMonth = now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear();

        if (isNewMonth || merchant.smsFreeMonthly === 0) {
            // New month detected or not initialized
            merchant.smsUsedThisMonth = 0;

            // Assign free monthly SMS based on plan
            const plan = merchant.subscriptionPlan || "Free";
            switch (plan) {
                case "Starter":
                case "Business":
                    merchant.smsFreeMonthly = 10;
                    break;
                case "Growth":
                case "Scale":
                    merchant.smsFreeMonthly = 50;
                    break;
                case "Pro":
                case "Enterprise":
                    merchant.smsFreeMonthly = 100;
                    break;
                default:
                    merchant.smsFreeMonthly = 5; // Default free allocation
            }

            merchant.lastCreditReset = now;
            await merchant.save();
        }

        res.json(merchant);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error" });
    }
});

// @route   PUT /api/user/profile
// @desc    Update user profile (name, email)
// @access  Private
router.put("/profile", authMiddleware, async (req, res) => {
    const { name, email } = req.body;
    try {
        const merchant = await Merchant.findById(req.user.merchantId);
        if (!merchant) {
            return res.status(404).json({ message: "Merchant not found" });
        }

        if (name !== undefined) merchant.name = name;
        if (email !== undefined) merchant.email = email;

        await merchant.save();
        res.json({
            message: "Profile updated successfully",
            user: {
                _id: merchant._id,
                phone: merchant.phone,
                name: merchant.name,
                businessName: merchant.businessName,
                businessType: merchant.businessType,
                email: merchant.email,
                currency: merchant.currency,
                preferences: merchant.preferences
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error" });
    }
});

// @route   PUT /api/user/business
// @desc    Update business details
// @access  Private
router.put("/business", authMiddleware, async (req, res) => {
    const { businessName, businessType, currency } = req.body;
    console.log(`[user.js] PUT /business called by merchantId=${req.user?.merchantId} body=${JSON.stringify(req.body)}`);
    try {
        const merchant = await Merchant.findById(req.user.merchantId);
        if (!merchant) {
            return res.status(404).json({ message: "Merchant not found" });
        }

        if (businessName) merchant.businessName = businessName;
        if (businessType) merchant.businessType = businessType;
        if (currency) merchant.currency = currency;

        await merchant.save();
        res.json({
            message: "Business details updated successfully",
            user: {
                _id: merchant._id,
                phone: merchant.phone,
                name: merchant.name,
                businessName: merchant.businessName,
                businessType: merchant.businessType,
                email: merchant.email,
                currency: merchant.currency,
                preferences: merchant.preferences
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error" });
    }
});

// @route   PUT /api/user/bank
// @desc    Update bank details
// @access  Private
router.put("/bank", authMiddleware, async (req, res) => {
    const { bankName, accountName, accountNumber } = req.body;
    try {
        const merchant = await Merchant.findById(req.user.merchantId);
        if (!merchant) {
            return res.status(404).json({ message: "Merchant not found" });
        }

        if (bankName !== undefined) merchant.bankName = bankName;
        if (accountName !== undefined) merchant.accountName = accountName;
        if (accountNumber !== undefined) merchant.accountNumber = accountNumber;

        await merchant.save();
        res.json({
            message: "Bank details updated successfully",
            user: {
                _id: merchant._id,
                phone: merchant.phone,
                name: merchant.name,
                businessName: merchant.businessName,
                businessType: merchant.businessType,
                email: merchant.email,
                currency: merchant.currency,
                preferences: merchant.preferences,
                bankName: merchant.bankName,
                accountName: merchant.accountName,
                accountNumber: merchant.accountNumber
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error" });
    }
});

// @route   PUT /api/user/password
// @desc    Update or set password
// @access  Private
router.put("/password", authMiddleware, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const merchant = await Merchant.findById(req.user.merchantId);
        if (!merchant) {
            return res.status(404).json({ message: "Merchant not found" });
        }

        // If user has a password, verify current password
        if (merchant.password) {
            if (!currentPassword) {
                return res.status(400).json({ message: "Current password is required" });
            }
            const isMatch = await bcrypt.compare(currentPassword, merchant.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Invalid current password" });
            }
        }

        // Validate new password
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters" });
        }

        // Hash and save new password
        const salt = await bcrypt.genSalt(10);
        merchant.password = await bcrypt.hash(newPassword, salt);

        await merchant.save();
        res.json({ message: "Password updated successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error" });
    }
});

// Preferences route moved to routes/userPreferences.js to avoid duplication

module.exports = router;
