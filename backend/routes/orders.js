const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const db = require("../services/database");
const { authMiddleware } = require("../middleware/authMiddleware");

const ALLOWED_STATUSES = ["PENDING", "ACCEPTED", "PROCESSING", "COMPLETED", "REJECTED", "CONFIRMED"];

router.post("/public", async (req, res) => {
    try {
        const { merchantId, customerPhone, customerName, items } = req.body;

        if (!merchantId || !customerPhone || !items || !items.length) {
            return res.status(400).json({ success: false, message: "Missing required order fields" });
        }

        const Merchant = require("../models/Merchant");
        const Product = require("../models/Product");
        const merchant = await Merchant.findById(merchantId);
        if (!merchant) {
            return res.status(404).json({ success: false, message: "Merchant not found" });
        }

        let totalAmount = 0;
        const orders = [];
        for (const item of items) {
            const product = await Product.findOne({ merchant: merchantId, productCode: item.productCode });
            if (product) {
                totalAmount += product.sellingPrice * item.quantity;
            }

            const orderPayload = {
                merchantId,
                merchantPhone: merchant.phone,
                customerPhone,
                customerName: customerName || null,
                productCode: item.productCode,
                productName: item.name,
                quantity: item.quantity
            };
            const order = await db.createOrder(orderPayload);
            orders.push(order);
        }

        // Send SMS to merchant
        try {
            const smsService = require("../services/smsService");
            const firstItem = items[0].name;
            const extraCount = items.length - 1;
            const msg = `NEW ORDER! ${customerName || customerPhone} ordered ${firstItem}${extraCount > 0 ? " +" + extraCount : ""}. View on dashboard.`;
            await smsService.sendSMS(merchant.phone, msg);
        } catch (smsErr) {
            console.error("Order SMS notification failed:", smsErr.message);
        }

        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            data: orders,
            merchant: {
                name: merchant.businessName,
                phone: merchant.phone,
                accountNumber: merchant.accountNumber,
                bankName: merchant.bankName,
                accountName: merchant.accountName
            },
            payment: {
                totalAmount
            }
        });
    } catch (err) {
        console.error("Public order error:", err.message);
        res.status(500).json({ success: false, message: "Failed to place order", error: err.message });
    }
});

// ==================== CONFIRM ORDER ====================
router.post("/confirm/:orderId", async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);

        if (!order)
            return res.status(404).json({ success: false, message: "Order not found" });

        if (order.status !== "PENDING")
            return res.status(400).json({ success: false, message: "Order already processed" });

        // NOW record the sale and reduce stock (merchant has confirmed)
        try {
            await db.recordSaleByCode(
                order.merchantId,
                order.productCode,
                order.quantity
            );
        } catch (saleErr) {
            console.error("Sale recording error during confirm:", saleErr.message);
            return res.status(400).json({ success: false, message: saleErr.message || "Failed to record sale" });
        }

        order.status = "CONFIRMED";
        order.confirmedAt = new Date();
        await order.save();

        res.json({ success: true, message: "Order confirmed", order });
    } catch (err) {
        console.error("Confirm order error:", err.message);
        res.status(500).json({ success: false, message: "Failed to confirm order", error: err.message });
    }
});

// ==================== REJECT ORDER ====================
router.post("/reject/:orderId", async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);

        if (!order)
            return res.status(404).json({ success: false, message: "Order not found" });

        if (order.status !== "PENDING")
            return res.status(400).json({ success: false, message: "Order already processed" });

        order.status = "REJECTED";
        await order.save();

        res.json({ success: true, message: "Order rejected", order });
    } catch (err) {
        console.error("Reject order error:", err.message);
        res.status(500).json({ success: false, message: "Failed to reject order", error: err.message });
    }
});

// ==================== UPDATE ORDER STATUS (NEW Lifecycle) ====================
router.patch("/:orderId/status", authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const { orderId } = req.params;

        if (!status || !ALLOWED_STATUSES.includes(status.toUpperCase())) {
            return res.status(400).json({ success: false, message: "Invalid or missing status" });
        }

        const order = await Order.findOne({ _id: orderId, merchantId: req.user.merchantId });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        order.status = status.toUpperCase();
        order.statusUpdatedAt = new Date();
        await order.save();

        res.json({ success: true, message: `Order status updated to ${status}`, data: order });
    } catch (err) {
        console.error("Update order status error:", err.message);
        res.status(500).json({ success: false, message: "Failed to update order status", error: err.message });
    }
});

// ==================== GET MERCHANT ORDERS (NEW — protected) ====================
// IMPORTANT: This must come BEFORE /merchant/:merchantId to avoid Express treating 'all' as an ObjectId
router.get("/merchant/all", authMiddleware, async (req, res) => {
    try {
        const { status, limit = 50, skip = 0 } = req.query;
        const query = { merchantId: req.user.merchantId };

        if (status) {
            query.status = status.toString().toUpperCase();
        }

        const [orders, totalCount] = await Promise.all([
            Order.find(query)
                .sort({ createdAt: -1 })
                .skip(Number(skip))
                .limit(Number(limit)),
            Order.countDocuments({ merchantId: req.user.merchantId })
        ]);

        const [pendingCount, completedCount, acceptedCount] = await Promise.all([
            Order.countDocuments({ merchantId: req.user.merchantId, status: "PENDING" }),
            Order.countDocuments({ merchantId: req.user.merchantId, status: { $in: ["COMPLETED", "CONFIRMED"] } }),
            Order.countDocuments({ merchantId: req.user.merchantId, status: "ACCEPTED" }),
        ]);

        res.json({
            success: true,
            data: orders,
            stats: {
                total: totalCount,
                pending: pendingCount,
                accepted: acceptedCount,
                completed: completedCount
            }
        });
    } catch (err) {
        console.error("GET merchant orders error:", err.message);
        res.status(500).json({ success: false, message: "Failed to fetch orders", error: err.message });
    }
});

// ==================== GET CUSTOMER ORDERS (NEW — phone-gated) ====================
router.get("/customer/all", async (req, res) => {
    try {
        const { phone } = req.query;

        if (!phone) {
            return res.status(400).json({ success: false, message: "Phone query parameter is required" });
        }

        const phoneVariants = [
            phone,
            phone.replace(/^0/, "+234"),
            phone.replace(/^\+234/, "0")
        ];

        const orders = await Order.find({ customerPhone: { $in: phoneVariants } })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate("merchantId", "businessName phone storeCode");

        res.json({ success: true, data: orders });
    } catch (err) {
        console.error("GET customer orders error:", err.message);
        res.status(500).json({ success: false, message: "Failed to fetch customer orders", error: err.message });
    }
});

// ==================== GET ORDERS BY MERCHANT (legacy — optional ?status= filter) ====================
router.get("/merchant/:merchantId", async (req, res) => {
    try {
        const query = { merchantId: req.params.merchantId };

        if (req.query.status) {
            query.status = req.query.status.toString().toUpperCase();
        }

        const orders = await Order.find(query).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error("Fetch orders error:", err.message);
        res.status(500).json({ message: "Failed to fetch orders", error: err.message });
    }
});

module.exports = router;
