const Merchant = require("../models/Merchant");
const Product = require("../models/Product");
const Sale = require("../models/Sale");
const Order = require("../models/Order");
const mongoose = require("mongoose");
const { normalizePhoneNumber, toLocalPhone } = require("../utils/phone");

// ================= CONNECTION =================
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("MongoDB Error:", error.message);
    process.exit(1);
  }
};

// ================= MERCHANT CODE =================
async function generateMerchantCode(businessName) {
  const prefix = (businessName || "MER")
    .replace(/[^a-zA-Z]/g, "")
    .substring(0, 3)
    .toUpperCase()
    .padEnd(3, "X");

  // Retry loop to ensure uniqueness
  for (let attempt = 0; attempt < 10; attempt++) {
    const digits = String(Math.floor(10 + Math.random() * 90));
    const code = prefix + digits;
    const exists = await Merchant.findOne({ merchantCode: code });
    if (!exists) return code;
  }

  // Fallback: use more digits
  const fallback = prefix + String(Math.floor(100 + Math.random() * 900));
  return fallback;
}

// ================= STORE CODE =================
async function generateStoreCode(businessName) {
  const prefix = (businessName || "MER")
    .replace(/[^a-zA-Z]/g, "")
    .substring(0, 3)
    .toUpperCase()
    .padEnd(3, "X");

  // Retry loop for uniqueness (e.g. SWE123)
  for (let attempt = 0; attempt < 20; attempt++) {
    const digits = String(Math.floor(100 + Math.random() * 900)); // 3 digits
    const code = prefix + digits;
    const exists = await Merchant.findOne({ storeCode: code });
    if (!exists) return code;
  }

  // Fallback: use 4 digits
  const fallback = prefix + String(Math.floor(1000 + Math.random() * 9000));
  return fallback;
}

// ================= USER =================
async function registerUser(phone, data) {
  const normalized = normalizePhoneNumber(phone);

  // Generate codes
  const merchantCode = await generateMerchantCode(data.businessName);
  const storeCode = await generateStoreCode(data.businessName);

  // Use atomic upsert to avoid duplicates for the same normalized phone.
  const merchant = await Merchant.findOneAndUpdate(
    { phone: normalized },
    {
      $setOnInsert: {
        phone: normalized,
        name: data.name || "",
        businessName: data.businessName,
        businessType: data.businessType || "General",
        merchantCode: merchantCode,
        storeCode: storeCode,
        password: null // USSD users have no password
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return merchant;
}

async function getUser(phone) {
  const normalized = normalizePhoneNumber(phone);
  return await Merchant.findOne({ phone: normalized });
}

async function getUserById(id) {
  return await Merchant.findById(id);
}

// ================= PRODUCT CODE =================
async function generateProductCode(merchantId) {
  const count = await Product.countDocuments({ merchant: merchantId });
  return `P${String(count + 1).padStart(3, "0")}`;
}

// ================= PRODUCTS =================
async function addProduct(merchantId, product) {
  return await Product.create({
    merchant: merchantId,
    productCode: product.productCode,
    name: product.name,
    category: product.category || "General",
    stock: product.stock,
    sellingPrice: product.sellingPrice,
    costPrice: product.costPrice,
    description: product.description || ""
  });
}

async function getProducts(merchantId) {
  return await Product.find({ merchant: merchantId }).sort({ createdAt: -1 });
}

async function getProductByCode(merchantId, code) {
  return await Product.findOne({
    merchant: merchantId,
    productCode: code
  });
}

async function updateProductByCode(merchantId, code, updates) {
  return await Product.findOneAndUpdate(
    { merchant: merchantId, productCode: code },
    updates,
    { new: true }
  );
}

async function deleteProductByCode(merchantId, code) {
  return await Product.findOneAndDelete({
    merchant: merchantId,
    productCode: code
  });
}

// ================= SALES (ATOMIC SAFE VERSION) =================
async function recordSaleByCode(merchantId, code, quantity) {

  if (quantity <= 0) {
    throw new Error("Invalid quantity");
  }

  // Atomic stock update (prevents negative stock race condition)
  const product = await Product.findOneAndUpdate(
    {
      merchant: merchantId,
      productCode: code,
      stock: { $gte: quantity }
    },
    { $inc: { stock: -quantity } },
    { new: true }
  );

  if (!product) {
    throw new Error("Not enough stock available or product not found");
  }

  const totalRevenue = quantity * product.sellingPrice;
  const totalProfit = quantity * (product.sellingPrice - product.costPrice);

  const sale = await Sale.create({
    merchantId: merchantId,
    productId: product._id,
    productName: product.name,
    quantity,
    totalRevenue,
    totalProfit
  });

  // After recording sale, if stock is low, notify merchant via SMS
  try {
    if (product.stock <= 5) {
      const smsService = require("./smsService");

      // Fetch merchant phone
      const merchantDoc = await Merchant.findById(merchantId);
      if (merchantDoc && merchantDoc.phone) {
        const alertMessage = `LOW STOCK ALERT\n${product.name}\nRemaining: ${product.stock}`;
        try {
          await smsService.sendSMS(merchantDoc.phone, alertMessage);
        } catch (err) {
          console.error("SMS failed:", err.message);
        }
      }
    }
  } catch (err) {
    console.error("Low-stock alert error:", err.message);
  }

  return {
    sale,
    updatedProduct: product,
    totalRevenue,
    totalProfit
  };
}

// ================= REPORTS =================
async function getWeeklyProfit(merchantId) {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const sales = await Sale.find({
    merchantId: merchantId,
    date: { $gte: oneWeekAgo }
  });

  let totalRevenue = 0;
  let totalItems = 0;
  let totalProfit = 0;

  sales.forEach(s => {
    totalRevenue += s.totalRevenue;
    totalItems += s.quantity;
    totalProfit += s.totalProfit;
  });

  return { totalRevenue, totalItems, totalProfit };
}

// ================= ORDERS =================
async function createOrder(data) {
  const order = await Order.create({
    merchantId: data.merchantId,
    merchantPhone: data.merchantPhone,
    customerPhone: data.customerPhone,
    productCode: data.productCode,
    productName: data.productName,
    quantity: data.quantity
  });

  // 🔥 PART 4 — AUTO-STORE CUSTOMER AFTER EVERY ORDER
  try {
    const Contact = require("../models/Contact");

    // Check both local and normalized versions to aggressively prevent duplicates
    const localFormat = toLocalPhone(data.customerPhone);
    const e164Format = normalizePhoneNumber(data.customerPhone);

    let contact = await Contact.findOne({
      merchantId: data.merchantId,
      phone: { $in: [localFormat, e164Format] }
    });

    if (contact) {
      contact.totalOrders += 1;
      contact.lastOrderDate = new Date();
      // Enforce local format strictly if it was an older +234 entry
      if (localFormat) {
        contact.phone = localFormat;
      }
      await contact.save();
    } else if (localFormat) {
      await Contact.create({
        merchantId: data.merchantId,
        phone: localFormat,
        totalOrders: 1,
        lastOrderDate: new Date()
      });
    }
  } catch (crmErr) {
    console.error("CRM Contact auto-storage failed:", crmErr.message);
    // Do not block order return
  }

  return order;
}

async function getMerchantOrders(merchantId) {
  return await Order.find({ merchantId })
    .sort({ createdAt: -1 })
    .limit(10);
}

async function getMerchantOrdersByPhone(phone) {
  return await Order.find({ merchantPhone: phone })
    .sort({ createdAt: -1 })
    .limit(10);
}

module.exports = {
  registerUser,
  getUser,
  getUserById,
  generateMerchantCode,
  generateStoreCode,
  generateProductCode,
  addProduct,
  getProducts,
  getProductByCode,
  updateProductByCode,
  deleteProductByCode,
  recordSaleByCode,
  getWeeklyProfit,
  createOrder,
  getMerchantOrders,
  getMerchantOrdersByPhone,
  connectDB
};
