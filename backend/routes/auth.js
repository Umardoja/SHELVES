const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Merchant = require("../models/Merchant");
const { generateToken } = require("../middleware/authMiddleware");
const smsService = require("../services/smsService");
const { normalizePhoneNumber } = require("../utils/authPhone");
const { generateMerchantCode } = require("../services/database");

// ==================== REGISTER (Web Only) ====================
router.post("/register", async (req, res) => {
    try {
        const { name, businessName, businessType, phone, password, isMerchant = true } = req.body;
        const normalizedPhone = normalizePhoneNumber(phone);

        if (!normalizedPhone || !password || (!businessName && isMerchant)) {
            return res.status(400).json({
                success: false,
                message: "Phone, password, and business name are required"
            });
        }

        // STRICT CHECK: Does this phone number ALREADY have a merchant profile?
        console.log("Registering merchant with phone:", normalizedPhone);
        const phoneVariants = [normalizedPhone, normalizedPhone.replace(/^0/, '+234')];
        const existingMerchant = await Merchant.findOne({
            phone: { $in: phoneVariants },
            merchantCode: { $ne: null }
        });

        if (existingMerchant && isMerchant !== false) {
            return res.status(409).json({
                success: false,
                message: "A merchant account already exists for this phone number. Please log in instead.",
                redirectTo: "/login"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const merchantCode = isMerchant !== false ? await generateMerchantCode(businessName) : null;

        const merchant = await Merchant.create({
            phone: normalizedPhone,
            name: name || "",
            businessName: businessName || "My Business",
            businessType: businessType || "General",
            merchantCode,
            password: hashedPassword,
            roles: {
                isCustomer: true,
                isMerchant: !!isMerchant
            }
        });

        const token = generateToken(merchant);

        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            token,
            user: {
                _id: merchant._id,
                phone: merchant.phone,
                name: merchant.name,
                businessName: merchant.businessName,
                businessType: merchant.businessType,
                merchantCode: merchant.merchantCode,
                storeCode: merchant.storeCode,
                roles: merchant.roles
            }
        });
    } catch (error) {
        console.error("Register Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

// ==================== LOGIN (Web Only) ====================
router.post("/login", async (req, res) => {
    try {
        const { phone, password } = req.body;
        const normalizedPhone = normalizePhoneNumber(phone);

        if (!normalizedPhone || !password) {
            return res.status(400).json({
                success: false,
                message: "Phone and password are required"
            });
        }

        // Login is based on phone number
        console.log("Searching merchant with phone (Standard Login):", normalizedPhone);
        const phoneVariants = [normalizedPhone, normalizedPhone.replace(/^0/, '+234')];
        const userRec = await Merchant.findOne({ phone: { $in: phoneVariants } });

        if (!userRec) {
            return res.status(401).json({
                success: false,
                message: "No account found with this number"
            });
        }

        if (!userRec.password) {
            return res.status(403).json({
                success: false,
                message: "NO_PASSWORD",
                hint: "This account was created via USSD. Please set a password first."
            });
        }

        const isMatch = await bcrypt.compare(password, userRec.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Wrong password. Please try again."
            });
        }

        // DETECT MERCHANT STATUS STRICTLY BY PHONE/RECORD
        const hasMerchant = !!(userRec.merchantCode && userRec.roles?.isMerchant);

        const token = generateToken(userRec);

        return res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                _id: userRec._id,
                phone: userRec.phone,
                name: userRec.name,
                businessName: userRec.businessName,
                businessType: userRec.businessType,
                merchantCode: userRec.merchantCode,
                storeCode: userRec.storeCode,
                hasMerchant: hasMerchant,
                roles: {
                    isCustomer: true,
                    isMerchant: hasMerchant
                }
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

// ==================== MERCHANT STRICT LOGIN (Web Only) ====================
// Used strictly for the /merchant/login portal
router.post("/merchant-login", async (req, res) => {
    try {
        const { phone, password } = req.body;
        const normalizedPhone = normalizePhoneNumber(phone);

        if (!normalizedPhone || !password) {
            return res.status(400).json({
                success: false,
                message: "Phone and password are required"
            });
        }

        console.log("Searching merchant with phone (Merchant Portal):", normalizedPhone);
        const phoneVariants = [normalizedPhone, normalizedPhone.replace(/^0/, '+234')];
        const userRec = await Merchant.findOne({ phone: { $in: phoneVariants } });

        // STRICT REJECTION: Must exist AND have a merchantCode (registered as merchant)
        if (!userRec || !userRec.merchantCode) {
            return res.status(401).json({
                success: false,
                message: "No merchant account found with this phone number. Please create a merchant account."
            });
        }

        if (!userRec.password) {
            return res.status(403).json({
                success: false,
                // Still a merchant, but missing password
                message: "NO_PASSWORD",
                hint: "This account was created via USSD. Please set a password first."
            });
        }

        const isMatch = await bcrypt.compare(password, userRec.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false, // User requested "Invalid credentials", but we'll use standard "Wrong password" for parity, or specific if needed.
                message: "Invalid credentials. Please try again."
            });
        }

        const token = generateToken(userRec);

        return res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                _id: userRec._id,
                phone: userRec.phone,
                businessName: userRec.businessName,
                merchantCode: userRec.merchantCode,
                roles: {
                    isCustomer: true,
                    isMerchant: true
                }
            }
        });
    } catch (error) {
        console.error("Merchant Login Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

// ==================== AUTH ME (Get Profile & Merchant Status) ====================
const { authMiddleware } = require("../middleware/authMiddleware");
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const userRec = await Merchant.findById(req.user.merchantId).select("-password -otp -otpExpiry");
        if (!userRec) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const hasMerchant = !!(userRec.merchantCode && userRec.roles?.isMerchant);

        return res.json({
            success: true,
            id: userRec._id,
            phone: userRec.phone,
            name: userRec.name,
            hasMerchant: hasMerchant,
            merchantId: hasMerchant ? userRec._id : null,
            roles: {
                isCustomer: true,
                isMerchant: hasMerchant
            }
        });
    } catch (error) {
        console.error("Auth Me Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

// ==================== CHECK PHONE (Does user exist? Has password?) ====================
router.post("/check-phone", async (req, res) => {
    try {
        const { phone } = req.body;
        const normalizedPhone = normalizePhoneNumber(phone);

        if (!normalizedPhone) {
            return res.status(400).json({ success: false, message: "Phone is required" });
        }

        const phoneVariants = [normalizedPhone, normalizedPhone.replace(/^0/, '+234')];
        const merchant = await Merchant.findOne({ phone: { $in: phoneVariants } });

        if (!merchant) {
            return res.json({
                success: true,
                exists: false,
                hasPassword: false
            });
        }

        return res.json({
            success: true,
            exists: true,
            hasPassword: !!merchant.password,
            businessName: merchant.businessName
        });
    } catch (error) {
        console.error("Check Phone Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

// ==================== SEND OTP (for USSD-created users without password) ====================
router.post("/send-otp", async (req, res) => {
    try {
        const { phone } = req.body;
        const normalizedPhone = normalizePhoneNumber(phone);

        if (!normalizedPhone) {
            return res.status(400).json({ success: false, message: "Phone is required" });
        }

        const phoneVariants = [normalizedPhone, normalizedPhone.replace(/^0/, '+234')];
        const merchant = await Merchant.findOne({ phone: { $in: phoneVariants } });

        if (!merchant) {
            return res.status(404).json({ success: false, message: "No account found" });
        }

        if (merchant.password) {
            return res.status(400).json({
                success: false,
                message: "Account already has a password. Use login instead."
            });
        }

        // Generate 6-digit OTP
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        merchant.otp = otp;
        merchant.otpExpiry = otpExpiry;
        await merchant.save();

        // Send OTP via SMS
        await smsService.sendSMS(
            normalizedPhone,
            `Your SHELVES verification code is: ${otp}. It expires in 10 minutes. Do not share this code.`
        );

        return res.json({
            success: true,
            message: "OTP sent to your phone"
        });
    } catch (error) {
        console.error("Send OTP Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

// ==================== VERIFY OTP ====================
router.post("/verify-otp", async (req, res) => {
    try {
        const { phone, otp } = req.body;
        const normalizedPhone = normalizePhoneNumber(phone);

        if (!normalizedPhone || !otp) {
            return res.status(400).json({ success: false, message: "Phone and OTP are required" });
        }

        const phoneVariants = [normalizedPhone, normalizedPhone.replace(/^0/, '+234')];
        const merchant = await Merchant.findOne({ phone: { $in: phoneVariants } });

        if (!merchant) {
            return res.status(404).json({ success: false, message: "No account found" });
        }

        if (merchant.otp !== otp) {
            return res.status(401).json({ success: false, message: "Wrong code. Please try again." });
        }

        if (merchant.otpExpiry && merchant.otpExpiry < new Date()) {
            return res.status(401).json({ success: false, message: "Code expired. Request a new one." });
        }

        // Clear OTP after successful verification
        merchant.otp = null;
        merchant.otpExpiry = null;
        await merchant.save();

        // Generate a temporary token to allow password creation
        const token = generateToken(merchant);

        return res.json({
            success: true,
            message: "Phone verified successfully",
            token,
            user: {
                _id: merchant._id,
                phone: merchant.phone,
                businessName: merchant.businessName,
                merchantCode: merchant.merchantCode,
                storeCode: merchant.storeCode
            }
        });
    } catch (error) {
        console.error("Verify OTP Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

// ==================== SET PASSWORD (after OTP verification) ====================
router.post("/set-password", async (req, res) => {
    try {
        const { phone, password, token } = req.body;
        const normalizedPhone = normalizePhoneNumber(phone);

        if (!normalizedPhone || !password) {
            return res.status(400).json({ success: false, message: "Phone and password are required" });
        }

        const phoneVariants = [normalizedPhone, normalizedPhone.replace(/^0/, '+234')];
        const merchant = await Merchant.findOne({ phone: { $in: phoneVariants } });

        if (!merchant) {
            return res.status(404).json({ success: false, message: "No account found" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        merchant.password = hashedPassword;
        await merchant.save();

        const newToken = generateToken(merchant);

        return res.json({
            success: true,
            message: "Password set successfully! You can now log in.",
            token: newToken,
            user: {
                _id: merchant._id,
                phone: merchant.phone,
                name: merchant.name,
                businessName: merchant.businessName,
                businessType: merchant.businessType,
                merchantCode: merchant.merchantCode,
                storeCode: merchant.storeCode
            }
        });
    } catch (error) {
        console.error("Set Password Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;
