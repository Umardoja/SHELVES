const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const Sale = require("../models/Sale");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Campaign = require("../models/Campaign");
const Contact = require("../models/Contact");
const mongoose = require("mongoose");

// All routes require JWT auth
router.use(authMiddleware);

// ==================== DASHBOARD REPORT ====================
// GET /api/reports/dashboard?range=today|week|month|all|custom&start=...&end=...
router.get("/dashboard", async (req, res) => {
    try {
        const { range, start, end } = req.query;
        const merchantId = new mongoose.Types.ObjectId(req.user.merchantId);

        let dateFilter = {};
        const now = new Date();

        if (range === 'today') {
            const d = new Date(); d.setHours(0, 0, 0, 0);
            dateFilter = { $gte: d };
        } else if (range === 'week') {
            const d = new Date(); d.setDate(d.getDate() - 7);
            dateFilter = { $gte: d };
        } else if (range === 'month') {
            const d = new Date(); d.setMonth(d.getMonth() - 1);
            dateFilter = { $gte: d };
        } else if (range === 'custom' && start && end) {
            dateFilter = { $gte: new Date(start), $lte: new Date(end) };
        } else {
            // Default to all time or a sensible large range if needed
            dateFilter = { $exists: true };
        }

        // 1. Sales & Profit Aggregation
        const salesStats = await Sale.aggregate([
            { $match: { merchantId, date: dateFilter } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalRevenue" },
                    totalProfit: { $sum: "$totalProfit" },
                    totalItems: { $sum: "$quantity" },
                    count: { $sum: 1 }
                }
            }
        ]);

        // 2. Trend Data (Daily for last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const trendData = await Sale.aggregate([
            { $match: { merchantId, date: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    revenue: { $sum: "$totalRevenue" },
                    profit: { $sum: "$totalProfit" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // 3. Top Selling Products
        const topProducts = await Sale.aggregate([
            { $match: { merchantId, date: dateFilter } },
            {
                $group: {
                    _id: "$productId",
                    name: { $first: "$productName" },
                    quantity: { $sum: "$quantity" },
                    revenue: { $sum: "$totalRevenue" }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 }
        ]);

        // 4. Inventory Metrics
        const inventoryStats = await Product.aggregate([
            { $match: { merchant: merchantId } },
            {
                $group: {
                    _id: null,
                    totalValue: { $sum: { $multiply: ["$stock", "$sellingPrice"] } },
                    lowStock: { $sum: { $cond: [{ $and: [{ $gt: ["$stock", 0] }, { $lte: ["$stock", 10] }] }, 1, 0] } },
                    outOfStock: { $sum: { $cond: [{ $eq: ["$stock", 0] }, 1, 0] } },
                    totalItems: { $sum: "$stock" }
                }
            }
        ]);

        // 5. Customer Metrics
        const customerStats = await Contact.aggregate([
            { $match: { merchantId } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    repeat: { $sum: { $cond: [{ $gt: ["$totalOrders", 1] }, 1, 0] } },
                    newThisMonth: {
                        $sum: {
                            $cond: [
                                { $gte: ["$createdAt", new Date(now.getFullYear(), now.getMonth(), 1)] },
                                1, 0
                            ]
                        }
                    }
                }
            }
        ]);

        // 6. Campaign Metrics
        const campaignStats = await Campaign.aggregate([
            { $match: { merchantId } },
            {
                $group: {
                    _id: null,
                    totalSent: { $sum: "$recipientsCount" },
                    campaignsCount: { $sum: 1 },
                    failed: { $sum: { $cond: [{ $eq: ["$status", "FAILED"] }, "$recipientsCount", 0] } }
                }
            }
        ]);

        const stats = {
            overview: salesStats[0] || { totalRevenue: 0, totalProfit: 0, totalItems: 0, count: 0 },
            trend: trendData,
            topProducts,
            inventory: inventoryStats[0] || { totalValue: 0, lowStock: 0, outOfStock: 0, totalItems: 0 },
            customers: customerStats[0] || { total: 0, repeat: 0, newThisMonth: 0 },
            campaigns: campaignStats[0] || { totalSent: 0, campaignsCount: 0, failed: 0 }
        };

        // Average Order Value calculation
        stats.overview.avgOrderValue = stats.overview.count > 0 ? (stats.overview.totalRevenue / stats.overview.count) : 0;
        // Profit margin
        stats.overview.profitMargin = stats.overview.totalRevenue > 0 ? (stats.overview.totalProfit / stats.overview.totalRevenue) * 100 : 0;

        return res.json({ success: true, data: stats });
    } catch (error) {
        console.error("Dashboard Report Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

// ==================== EXPORT DATA ====================
// POST /api/reports/export
router.post("/export", async (req, res) => {
    try {
        const { range, start, end } = req.body;
        const merchantId = req.user.merchantId;

        let dateFilter = {};
        if (range === 'custom' && start && end) {
            dateFilter = { $gte: new Date(start), $lte: new Date(end) };
        } else if (range === 'week') {
            const d = new Date(); d.setDate(d.getDate() - 7);
            dateFilter = { $gte: d };
        } else if (range === 'month') {
            const d = new Date(); d.setMonth(d.getMonth() - 1);
            dateFilter = { $gte: d };
        } else {
            dateFilter = { $exists: true };
        }

        const sales = await Sale.find({ merchantId, date: dateFilter }).sort({ date: -1 }).lean();

        if (!sales || sales.length === 0) {
            return res.status(404).json({ success: false, message: "No data found for the selected range" });
        }

        // Generate CSV header
        let csv = "Date,Product Name,Quantity,Revenue,Profit\n";

        sales.forEach(s => {
            const dateStr = new Date(s.date).toLocaleDateString();
            csv += `${dateStr},"${s.productName}",${s.quantity},${s.totalRevenue},${s.totalProfit}\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=report_${range}_${new Date().getTime()}.csv`);
        return res.send(csv);

    } catch (error) {
        console.error("Export Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;
