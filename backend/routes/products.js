const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const db = require("../services/database");

const Merchant = require("../models/Merchant");
const Product = require("../models/Product");

// ==================== GET ALL UNIQUE CATEGORIES ====================
router.get("/categories", async (req, res) => {
    try {
        const categories = await Product.distinct("category");
        return res.json({ success: true, data: categories });
    } catch (error) {
        console.error("Get Categories Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

// ==================== GET ALL PUBLIC PRODUCTS ====================
// Used for global search and home page
router.get("/public", async (req, res) => {
    try {
        const { search, category, merchantId, page = 1, limit = 12, sort = "newest" } = req.query;
        let query = {};

        if (merchantId) query.merchant = merchantId;
        if (category) query.category = category;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } }
            ];
        }

        // Sorting Logic
        let sortOrder = { createdAt: -1 }; // Default: Newest
        if (sort === "price_high") sortOrder = { sellingPrice: -1 };
        if (sort === "price_low") sortOrder = { sellingPrice: 1 };

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const total = await Product.countDocuments(query);
        const products = await Product.find(query)
            .populate("merchant", "businessName storeCode")
            .sort(sortOrder)
            .skip(skip)
            .limit(parseInt(limit));

        return res.json({
            success: true,
            data: products,
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error("Public Get Products Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

// ==================== GET SINGLE PUBLIC PRODUCT ====================
router.get("/public/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate("merchant", "businessName storeCode phone bankName accountName accountNumber");

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        return res.json({ success: true, data: product });
    } catch (error) {
        console.error("Public Get Single Product Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

// All routes below require JWT auth (Merchant actions)
router.use(authMiddleware);

// ==================== GET ALL PRODUCTS ====================
router.get("/", async (req, res) => {
    try {
        const products = await db.getProducts(req.user.merchantId);
        return res.json({ success: true, data: products });
    } catch (error) {
        console.error("Get Products Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

// ==================== ADD PRODUCT ====================
router.post("/", async (req, res) => {
    try {
        const { name, stock, sellingPrice, costPrice, category, description } = req.body;

        if (!name || sellingPrice === undefined || costPrice === undefined) {
            return res.status(400).json({
                success: false,
                message: "Name, selling price, and cost price are required"
            });
        }

        const productCode = await db.generateProductCode(req.user.merchantId);

        const product = await db.addProduct(req.user.merchantId, {
            productCode,
            name,
            stock: stock || 0,
            sellingPrice: parseFloat(sellingPrice),
            costPrice: parseFloat(costPrice),
            category: category || "General",
            description: description || ""
        });

        return res.status(201).json({
            success: true,
            message: "Product added",
            data: product
        });
    } catch (error) {
        console.error("Add Product Error:", error);
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: "Product already exists" });
        }
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

// ==================== UPDATE PRODUCT ====================
router.put("/:id", async (req, res) => {
    try {
        const Product = require("../models/Product");
        const { name, stock, sellingPrice, costPrice, category, description } = req.body;

        const updates = {};
        if (name !== undefined) updates.name = name;
        if (stock !== undefined) updates.stock = parseInt(stock);
        if (sellingPrice !== undefined) updates.sellingPrice = parseFloat(sellingPrice);
        if (costPrice !== undefined) updates.costPrice = parseFloat(costPrice);
        if (category !== undefined) updates.category = category;
        if (description !== undefined) updates.description = description;

        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, merchant: req.user.merchantId },
            updates,
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        return res.json({ success: true, message: "Product updated", data: product });
    } catch (error) {
        console.error("Update Product Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

// ==================== DELETE PRODUCT ====================
router.delete("/:id", async (req, res) => {
    try {
        const Product = require("../models/Product");

        const product = await Product.findOneAndDelete({
            _id: req.params.id,
            merchant: req.user.merchantId
        });

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        return res.json({ success: true, message: "Product deleted" });
    } catch (error) {
        console.error("Delete Product Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;
