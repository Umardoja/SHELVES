const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const db = require("../services/database");
const Sale = require("../models/Sale");

// All routes require JWT auth
router.use(authMiddleware);

// ==================== RECORD SALE ====================
router.post("/", async (req, res) => {
    try {
        const { productCode, productId, quantity } = req.body;
        const qty = parseInt(quantity);

        if (!qty || qty <= 0) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid quantity"
            });
        }

        // Support both productCode (USSD style) and productId (web style)
        let result;
        if (productCode) {
            result = await db.recordSaleByCode(req.user.merchantId, productCode, qty);
        } else if (productId) {
            // Find product by ID, get code, then record
            const Product = require("../models/Product");
            const product = await Product.findOne({
                _id: productId,
                merchant: req.user.merchantId
            });

            if (!product) {
                return res.status(404).json({ success: false, message: "Product not found" });
            }

            result = await db.recordSaleByCode(req.user.merchantId, product.productCode, qty);
        } else {
            return res.status(400).json({
                success: false,
                message: "Product code or ID is required"
            });
        }

        return res.status(201).json({
            success: true,
            message: "Sale recorded",
            data: result
        });
    } catch (error) {
        console.error("Record Sale Error:", error);
        if (error.message.includes("Not enough stock")) {
            return res.status(400).json({ success: false, message: "Not enough stock available" });
        }
        return res.status(500).json({ success: false, message: error.message || "Server error" });
    }
});

// ==================== GET SALES ====================
router.get("/", async (req, res) => {
    try {
        const { period } = req.query; // today, week, month, all
        let dateFilter = {};

        if (period === "today") {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            dateFilter = { date: { $gte: today } };
        } else if (period === "week") {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            dateFilter = { date: { $gte: weekAgo } };
        } else if (period === "month") {
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            dateFilter = { date: { $gte: monthAgo } };
        }

        const sales = await Sale.find({
            merchantId: req.user.merchantId,
            ...dateFilter
        })
            .sort({ date: -1 })
            .limit(100)
            .lean();

        return res.json({ success: true, data: sales });
    } catch (error) {
        console.error("Get Sales Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;
