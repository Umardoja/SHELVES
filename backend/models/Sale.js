const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema({
  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Merchant"
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },
  productName: String,
  quantity: Number,
  totalRevenue: Number,
  totalProfit: Number,
  date: { type: Date, default: Date.now }
});

saleSchema.index({ merchantId: 1 });
saleSchema.index({ date: 1 });

module.exports = mongoose.model("Sale", saleSchema);
