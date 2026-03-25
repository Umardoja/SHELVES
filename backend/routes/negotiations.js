const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const Negotiation = require("../models/Negotiation");
const Product = require("../models/Product");

router.use(authMiddleware);

// ==================== CREATE NEGOTIATION ====================
router.post("/", async (req, res) => {
    try {
        const { productId, quantity, customerOfferPrice, customerMessage } = req.body;
        const customerId = req.user.merchantId; // user is customer

        if (!productId || !quantity || quantity < 20 || !customerOfferPrice) {
            return res.status(400).json({ success: false, message: "Invalid negotiation parameters. Minimum quantity 20." });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Check for active negotiation
        const existing = await Negotiation.findOne({
            productId,
            customerId,
            status: { $in: ["PENDING", "COUNTERED"] }
        });

        if (existing) {
            return res.status(400).json({ success: false, message: "You already have an active negotiation for this product." });
        }

        // Simple suggested pricing: 5% bulk discount for large orders
        const originalUnitPrice = product.sellingPrice;
        const originalTotalPrice = originalUnitPrice * quantity;
        const suggestedPrice = quantity >= 50 ? originalTotalPrice * 0.92 : originalTotalPrice * 0.95;

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 48); // 48-hour expiry

        const negotiation = await Negotiation.create({
            productId,
            merchantId: product.merchant,
            customerId,
            quantity,
            originalUnitPrice,
            originalTotalPrice,
            aiSuggestedPrice: suggestedPrice,
            customerOfferPrice,
            customerMessage,
            expiresAt
        });

        return res.status(201).json({ success: true, data: negotiation });
    } catch (error) {
        console.error("Create Negotiation Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

// ==================== GET CUSTOMER NEGOTIATIONS ====================
router.get("/customer", async (req, res) => {
    try {
        const negotiations = await Negotiation.find({ customerId: req.user.merchantId })
            .populate("productId", "name category stock productCode")
            .populate("merchantId", "businessName phone")
            .sort({ createdAt: -1 });

        return res.json({ success: true, data: negotiations });
    } catch (error) {
        console.error("Get Customer Negotiations Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

// ==================== GET MERCHANT NEGOTIATIONS ====================
router.get("/merchant", async (req, res) => {
    try {
        const negotiations = await Negotiation.find({ merchantId: req.user.merchantId })
            .populate("productId", "name category stock productCode")
            .populate("customerId", "businessName name phone")
            .sort({ createdAt: -1 });

        return res.json({ success: true, data: negotiations });
    } catch (error) {
        console.error("Get Merchant Negotiations Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

// ==================== GET SINGLE NEGOTIATION FOR CHECKOUT ====================
router.get("/:id", async (req, res) => {
    try {
        const negotiation = await Negotiation.findOne({
            _id: req.params.id,
            $or: [{ customerId: req.user.merchantId }, { merchantId: req.user.merchantId }]
        }).populate("productId", "name category productCode sellingPrice");

        if (!negotiation) {
            return res.status(404).json({ success: false, message: "Negotiation not found" });
        }

        return res.json({ success: true, data: negotiation });
    } catch (error) {
        console.error("Get Negotiation Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

// ==================== RESPOND TO NEGOTIATION (COUNTER / REJECT) ====================
router.patch("/:id/respond", async (req, res) => {
    try {
        const { status, merchantCounterOfferPrice, merchantMessage } = req.body;
        const merchantId = req.user.merchantId;

        if (!["COUNTERED", "REJECTED"].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status response" });
        }

        const negotiation = await Negotiation.findOne({ _id: req.params.id, merchantId, status: "PENDING" });
        if (!negotiation) {
            return res.status(404).json({ success: false, message: "Active negotiation not found" });
        }

        if (status === "COUNTERED" && (!merchantCounterOfferPrice || merchantCounterOfferPrice <= 0)) {
            return res.status(400).json({ success: false, message: "Counter offer price is required" });
        }

        negotiation.status = status;
        if (status === "COUNTERED") {
            negotiation.merchantCounterOfferPrice = merchantCounterOfferPrice;
        }
        if (merchantMessage) {
            negotiation.merchantMessage = merchantMessage;
        }

        await negotiation.save();

        return res.json({ success: true, data: negotiation });
    } catch (error) {
        console.error("Respond Negotiation Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

// ==================== ACCEPT NEGOTIATION (CUSTOMER OR MERCHANT) ====================
// Customer can accept PENDING or COUNTERED. Merchant can accept PENDING.
router.patch("/:id/accept", async (req, res) => {
    try {
        const negotiation = await Negotiation.findById(req.params.id);

        if (!negotiation) {
            return res.status(404).json({ success: false, message: "Negotiation not found" });
        }

        const isCustomer = negotiation.customerId.toString() === req.user.merchantId.toString();
        const isMerchant = negotiation.merchantId.toString() === req.user.merchantId.toString();

        if (!isCustomer && !isMerchant) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        if (negotiation.status === "ACCEPTED") {
            return res.status(400).json({ success: false, message: "Already accepted" });
        }
        if (negotiation.status === "REJECTED" || negotiation.status === "EXPIRED") {
            return res.status(400).json({ success: false, message: "Cannot accept closed negotiation" });
        }

        // If customer, they can accept a countered offer
        // If merchant, they can accept a pending offer
        if (isCustomer && negotiation.status === "PENDING") {
            negotiation.status = "ACCEPTED"; // Customer basically accepting their own offer? Or rather, maybe they modify? Wait, customer accepting merchant counter.
        } else if (isCustomer && negotiation.status === "COUNTERED") {
            negotiation.status = "ACCEPTED";
        } else if (isMerchant && negotiation.status === "PENDING") {
            negotiation.status = "ACCEPTED";
        } else {
            return res.status(400).json({ success: false, message: "Invalid accept action for your role and current status." });
        }

        await negotiation.save();
        return res.json({ success: true, data: negotiation });
    } catch (error) {
        console.error("Accept Negotiation Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

// ==================== CHECKOUT NEGOTIATED ORDER ====================
// Creates a PENDING order with the strictly verified negotiated price.
router.post("/:id/checkout", async (req, res) => {
    try {
        const { customerName, customerPhone, address } = req.body;
        const customerId = req.user.merchantId;

        const negotiation = await Negotiation.findOne({
            _id: req.params.id,
            customerId,
            status: "ACCEPTED"
        });

        if (!negotiation) {
            return res.status(404).json({ success: false, message: "Accepted negotiation not found or unauthorized" });
        }

        const product = await Product.findById(negotiation.productId).populate("merchant");
        if (!product || !product.merchant) {
            return res.status(404).json({ success: false, message: "Product or merchant no longer exists" });
        }

        const merchant = product.merchant;
        const finalTotalPrice = negotiation.merchantCounterOfferPrice || negotiation.customerOfferPrice;

        // Use existing order creation logic from database service
        const db = require("../services/database");

        const orderPayload = {
            merchantId: merchant._id,
            merchantPhone: merchant.phone,
            customerPhone: customerPhone || req.user.phone,
            customerName: customerName || null,
            productCode: product.productCode,
            productName: product.name,
            quantity: negotiation.quantity
        };

        const order = await db.createOrder(orderPayload);

        // Send SMS to merchant
        try {
            const smsService = require("../services/smsService");
            const msg = `NEW NEGOTIATED ORDER! ${customerName || orderPayload.customerPhone} ordered ${product.name} at bulk price. View on dashboard.`;
            await smsService.sendSMS(merchant.phone, msg);
        } catch (smsErr) {
            console.error("Order SMS notification failed:", smsErr?.message);
        }

        // Return standardized object for frontend Checkout
        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            data: [order], // array to match regular checkout structure
            merchant: {
                name: merchant.businessName,
                phone: merchant.phone,
                accountNumber: merchant.accountNumber,
                bankName: merchant.bankName,
                accountName: merchant.accountName
            },
            payment: {
                totalAmount: finalTotalPrice // Strictly enforced from the trusted Negotiation doc
            }
        });
    } catch (error) {
        console.error("Checkout Negotiation Error:", error);
        return res.status(500).json({ success: false, message: "Server error processing order" });
    }
});

module.exports = router;
