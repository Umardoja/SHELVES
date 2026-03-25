const mongoose = require("mongoose");

const merchantSchema = new mongoose.Schema({
  phone: { type: String, unique: true, required: true },
  name: { type: String, default: "" },
  businessName: { type: String, required: true },
  merchantCode: { type: String, unique: true, sparse: true },
  storeCode: { type: String, unique: true, sparse: true },
  businessType: { type: String, default: "General" },
  password: { type: String, default: null }, // null for USSD-only users
  email: { type: String, default: "" },
  currency: { type: String, default: "₦" },
  subscriptionPlan: { type: String, default: "Free" },
  roles: {
    isCustomer: { type: Boolean, default: true },
    isMerchant: { type: Boolean, default: false }
  },
  preferences: {
    notifications: {
      sms: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      app: { type: Boolean, default: true }
    }
  },
  otp: { type: String, default: null },
  otpExpiry: { type: Date, default: null },
  bankName: { type: String },
  accountName: { type: String },
  accountNumber: { type: String },
  smsCredits: { type: Number, default: 0 },
  smsFreeMonthly: { type: Number, default: 0 },
  smsUsedThisMonth: { type: Number, default: 0 },
  lastCreditReset: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Merchant", merchantSchema);
