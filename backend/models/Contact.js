const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema({
    merchantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Merchant",
        required: true
    },

    phone: {
        type: String,
        required: true
    },

    name: String,

    totalOrders: {
        type: Number,
        default: 0
    },

    lastOrderDate: Date,

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Contact", ContactSchema);
