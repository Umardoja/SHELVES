const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const Sale = require("../models/Sale");

// ==================== NOTIFICATION SUMMARY ====================
router.get("/summary/:merchantId", async (req, res) => {
    try {
        const merchantId = req.params.merchantId;

        // 1. Pending orders count
        const pendingOrders = await Order.countDocuments({
            merchantId,
            status: "PENDING"
        });

        // 2. Low stock items (stock <= 5)
        const lowStockItems = await Product.find({
            merchant: merchantId,
            stock: { $lte: 5 }
        }).select("name productCode stock sellingPrice").sort({ stock: 1 }).limit(10);

        // 3. Biweekly profit (last 14 days)
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        const recentSales = await Sale.find({
            merchantId,
            date: { $gte: twoWeeksAgo }
        });

        let biweeklyRevenue = 0;
        let biweeklyProfit = 0;
        let biweeklyItems = 0;

        recentSales.forEach(s => {
            biweeklyRevenue += s.totalRevenue || 0;
            biweeklyProfit += s.totalProfit || 0;
            biweeklyItems += s.quantity || 0;
        });

        res.json({
            pendingOrders,
            lowStockItems,
            biweeklyProfit: {
                revenue: biweeklyRevenue,
                profit: biweeklyProfit,
                itemsSold: biweeklyItems
            }
        });
    } catch (err) {
        console.error("Notification summary error:", err.message);
        res.status(500).json({ message: "Failed to load notifications" });
    }
});

module.exports = router;
