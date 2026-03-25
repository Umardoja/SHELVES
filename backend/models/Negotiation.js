const mongoose = require("mongoose");

const negotiationSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true
        },
        merchantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Merchant",
            required: true,
            index: true
        },
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Merchant", // Customers use the same Merchant model with roles.isCustomer = true
            required: true,
            index: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        originalUnitPrice: {
            type: Number,
            required: true,
            min: 0
        },
        originalTotalPrice: {
            type: Number,
            required: true,
            min: 0
        },
        aiSuggestedPrice: {
            type: Number,
            required: true,
            min: 0
        },
        customerOfferPrice: {
            type: Number,
            required: true,
            min: 0
        },
        merchantCounterOfferPrice: {
            type: Number,
            default: null
        },
        status: {
            type: String,
            enum: ["PENDING", "COUNTERED", "ACCEPTED", "REJECTED", "EXPIRED"],
            default: "PENDING"
        },
        customerMessage: {
            type: String,
            trim: true,
            maxlength: 1000
        },
        merchantMessage: {
            type: String,
            trim: true,
            maxlength: 1000
        },
        expiresAt: {
            type: Date,
            required: true
        }
    },
    { timestamps: true }
);

// Optional: ensure unique active negotiation per customer & product combination
negotiationSchema.index(
    { productId: 1, customerId: 1, status: 1 },
    { partialFilterExpression: { status: { $in: ["PENDING", "COUNTERED"] } }, unique: true }
);

module.exports = mongoose.model("Negotiation", negotiationSchema);
