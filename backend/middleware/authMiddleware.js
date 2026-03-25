const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "upstock-secret-change-in-production";

/**
 * JWT auth middleware for protected web routes.
 * Extracts merchantId from token and attaches to req.user
 */
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = {
            merchantId: decoded.merchantId,
            phone: decoded.phone,
            businessName: decoded.businessName
        };
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
}

/**
 * Generate JWT token for a merchant
 */
function generateToken(merchant) {
    return jwt.sign(
        {
            merchantId: merchant._id,
            phone: merchant.phone,
            businessName: merchant.businessName
        },
        JWT_SECRET,
        { expiresIn: "7d" }
    );
}

module.exports = { authMiddleware, generateToken };
