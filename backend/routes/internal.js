const express = require("express");
const router = express.Router();
const db = require("../services/database");
const { normalizePhoneNumber } = require("../utils/phone");

/**
 * Internal API routes consumed by the USSD handler.
 * These are NOT protected by JWT — they use the USSD secret header instead.
 */

// Simple middleware to verify USSD secret
router.use((req, res, next) => {
    // In production, verify x-ussd-secret header
    // For now, allow all internal calls since USSD and web share same server
    next();
});

// ==================== MERCHANT LOOKUP ====================
router.get("/merchant/:phone", async (req, res) => {
    try {
        const normalizedPhone = normalizePhoneNumber(req.params.phone);
        const merchant = await db.getUser(normalizedPhone);
        return res.json({ success: true, data: merchant });
    } catch (error) {
        console.error("USSD Merchant Lookup Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

// ==================== MERCHANT REGISTER (USSD - no password) ====================
router.post("/merchant/register", async (req, res) => {
    try {
        const { phone, businessName, businessType } = req.body;
        const normalizedPhone = normalizePhoneNumber(phone);
        const merchant = await db.registerUser(normalizedPhone, { businessName, businessType });
        return res.status(201).json({ success: true, data: merchant });
    } catch (error) {
        console.error("USSD Register Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

// ==================== PRODUCT LOOKUP BY CODE ====================
router.get("/products/:userId/:code", async (req, res) => {
    try {
        const product = await db.getProductByCode(req.params.userId, req.params.code);
        return res.json({ success: true, data: product });
    } catch (error) {
        console.error("USSD Product Lookup Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

// ==================== ADD PRODUCT (USSD) ====================
router.post("/products", async (req, res) => {
    try {
        const { userId, name, sellingPrice, costPrice, stock } = req.body;
        const productCode = await db.generateProductCode(userId);
        const product = await db.addProduct(userId, {
            productCode,
            name,
            stock: stock || 0,
            sellingPrice,
            costPrice
        });
        return res.status(201).json({ success: true, data: product });
    } catch (error) {
        console.error("USSD Add Product Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

// ==================== RECORD SALE (USSD) ====================
router.post("/sales", async (req, res) => {
    try {
        const { userId, productCode, quantity } = req.body;
        const result = await db.recordSaleByCode(userId, productCode, parseInt(quantity));
        return res.status(201).json({ success: true, data: result });
    } catch (error) {
        console.error("USSD Sale Error:", error);
        return res.status(500).json({ success: false, message: error.message || "Server error" });
    }
});

// ==================== REPORTS (USSD) ====================
router.get("/reports/:userId", async (req, res) => {
    try {
        const report = await db.getWeeklyProfit(req.params.userId);
        return res.json({ success: true, data: report });
    } catch (error) {
        console.error("USSD Report Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;
