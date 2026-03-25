const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Merchant",
      required: true,
      index: true
    },

    productCode: {
      type: String,
      required: true,
      trim: true
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },

    category: {
      type: String,
      default: "General",
      trim: true
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },

    sellingPrice: {
      type: Number,
      required: true,
      min: 0
    },

    costPrice: {
      type: Number,
      required: true,
      min: 0
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000
    }
  },
  { timestamps: true }
);

//
// 🔒 UNIQUE PER MERCHANT
//
productSchema.index(
  { merchant: 1, productCode: 1 },
  { unique: true }
);

module.exports = mongoose.model("Product", productSchema);
