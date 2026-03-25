const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Merchant"
  },

  merchantPhone: String,

  customerPhone: {
    type: String,
    required: true
  },

  // Customer name saved at order creation for display without joins
  customerName: String,

  productCode: String,

  productName: String,

  quantity: Number,

  status: {
    type: String,
    // Existing values preserved. New values added.
    enum: ["PENDING", "CONFIRMED", "REJECTED", "CANCELLED_BY_CUSTOMER", "ACCEPTED", "PROCESSING", "COMPLETED"],
    default: "PENDING"
  },

  // NEW — updated whenever merchant changes status
  statusUpdatedAt: Date,

  // NEW — optional note from merchant visible to customer
  merchantNote: String,

  // NEW — payment tracking
  paymentStatus: {
    type: String,
    enum: ["PENDING", "PAID"],
    default: "PENDING"
  },

  paystackReference: String,

  createdAt: {
    type: Date,
    default: Date.now
  },

  confirmedAt: Date
});

module.exports = mongoose.model("Order", OrderSchema);
