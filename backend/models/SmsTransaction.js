const mongoose = require("mongoose");

const smsTransactionSchema = new mongoose.Schema({
    merchantId: { type: mongoose.Schema.Types.ObjectId, ref: "Merchant", required: true },
    quantity: { type: Number, required: true },
    amount: { type: Number, required: true },
    paymentReference: { type: String, required: true, unique: true },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("SmsTransaction", smsTransactionSchema);
