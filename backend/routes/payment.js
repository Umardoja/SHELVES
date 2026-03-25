const express = require("express");
const router = express.Router();
const axios = require("axios");
const Order = require("../models/Order");
const Merchant = require("../models/Merchant");
const SmsTransaction = require("../models/SmsTransaction");
const paystackConfig = require("../config/paystack");

const PAYSTACK_SECRET = paystackConfig.secretKey;
const PAYSTACK_BASE_URL = paystackConfig.baseUrl;

// Payment verification route (Client-side callback)
router.post("/verify", async (req, res) => {
    try {
        const { reference, orderIds } = req.body;

        if (!reference || !orderIds || !orderIds.length) {
            return res.status(400).json({ success: false, message: "Missing reference or order IDs" });
        }

        const response = await axios.get(`${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET}`
            }
        });

        if (response.data.status && response.data.data.status === "success") {
            const { metadata, amount, customer, reference: verifiedRef } = response.data.data;

            // HANDLE SMS CREDIT PURCHASE
            if (metadata && metadata.type === "SMS_CREDIT_PURCHASE") {
                const quantity = metadata.quantity || 0;
                const merchantId = metadata.merchantId;

                if (!merchantId || !quantity) {
                    return res.status(400).json({ success: false, message: "Invalid SMS metadata" });
                }

                const merchant = await Merchant.findById(merchantId);
                if (merchant) {
                    merchant.smsCredits = (merchant.smsCredits || 0) + parseInt(quantity);
                    await merchant.save();

                    // Create Transaction Record
                    await SmsTransaction.create({
                        merchantId,
                        quantity,
                        amount: amount / 100, // Convert from kobo
                        paymentReference: verifiedRef,
                        date: new Date()
                    });
                }
                return res.json({ success: true, message: "SMS credits added successfully" });
            }

            // HANDLE ORDER PAYMENT (Existing flow)
            if (orderIds && orderIds.length) {
                await Order.updateMany(
                    { _id: { $in: orderIds } },
                    {
                        $set: {
                            paymentStatus: "PAID",
                            paystackReference: reference
                        }
                    }
                );
                return res.json({ success: true, message: "Payment verified successfully" });
            }

            return res.json({ success: true, message: "Payment verified" });
        } else {
            return res.status(400).json({ success: false, message: "Payment verification failed" });
        }
    } catch (err) {
        console.error("Paystack verification error:", err.response?.data || err.message);
        res.status(500).json({ success: false, message: "Server error during verification" });
    }
});

// Paystack Webhook handler (For server-to-server reliability)
router.post("/webhook", async (req, res) => {
    try {
        const crypto = require("crypto");
        const hash = crypto.createHmac("sha512", PAYSTACK_SECRET).update(JSON.stringify(req.body)).digest("hex");

        if (hash === req.headers["x-paystack-signature"]) {
            const event = req.body;
            if (event.event === "charge.success") {
                const { reference, metadata, amount } = event.data;

                // HANDLE SMS CREDIT PURCHASE
                if (metadata && metadata.type === "SMS_CREDIT_PURCHASE") {
                    const quantity = metadata.quantity || 0;
                    const merchantId = metadata.merchantId;

                    if (merchantId && quantity) {
                        const merchant = await Merchant.findById(merchantId);
                        if (merchant) {
                            merchant.smsCredits = (merchant.smsCredits || 0) + parseInt(quantity);
                            await merchant.save();

                            // Track Transaction (Safe uniqueness with reference)
                            try {
                                await SmsTransaction.create({
                                    merchantId,
                                    quantity,
                                    amount: amount / 100,
                                    paymentReference: reference,
                                    date: new Date()
                                });
                            } catch (e) {
                                // Likely already created via verify route, ignore
                            }
                        }
                    }
                }

                // HANDLE ORDER PAYMENT (Existing flow)
                if (metadata && metadata.orderIds) {
                    await Order.updateMany(
                        { _id: { $in: metadata.orderIds } },
                        {
                            $set: {
                                paymentStatus: "PAID",
                                paystackReference: reference
                            }
                        }
                    );
                }
            }
        }
        res.sendStatus(200);
    } catch (err) {
        console.error("Paystack Webhook error:", err.message);
        res.sendStatus(500);
    }
});

module.exports = router;
