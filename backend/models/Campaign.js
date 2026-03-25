const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema({
    merchantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Merchant',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    recipientsCount: {
        type: Number,
        required: true
    },
    dateSent: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ["SENT", "FAILED"],
        default: "SENT"
    }
});

module.exports = mongoose.model("Campaign", campaignSchema);
