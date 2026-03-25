require("dotenv").config({ override: true });

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { connectDB } = require("./services/database");

// ==================== CRASH PROTECTION ====================
// Prevent any uncaught error or unhandled rejection from silently killing the server
process.on("uncaughtException", (err) => {
  console.error("[UNCAUGHT EXCEPTION] Server will continue:", err.message, err.stack);
});

process.on("unhandledRejection", (reason) => {
  console.error("[UNHANDLED REJECTION] Server will continue:", reason);
});


// Route imports
const ussdRoutes = require("./routes/ussd");
const smsRoutes = require("./routes/sms");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const salesRoutes = require("./routes/salesApi");
const reportRoutes = require("./routes/reports");
const internalRoutes = require("./routes/internal");
const userRoutes = require("./routes/user");
const userPrefRoutes = require("./routes/userPreferences");
const orderRoutes = require("./routes/orders");
const contactRoutes = require("./routes/contacts");
const notificationRoutes = require("./routes/notifications");
const paymentRoutes = require("./routes/payment");
const merchantRoutes = require("./routes/merchants");

const app = express();


// ==================== REQUEST LOGGER ====================
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl} Host:${req.headers.host}`);
  next();
});


// ==================== MIDDLEWARE ====================
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// ==================== ROOT ====================
app.get("/", (req, res) => {
  res.json({
    status: "SHELVES Backend Running",
    message: "Server is live",
    version: "2.0.0"
  });
});


// ==================== WEB API ROUTES ====================
console.log("Registering /api/auth...");
app.use("/api/auth", authRoutes);

console.log("Registering /api/products...");
app.use("/api/products", productRoutes);

console.log("Registering /api/sales...");
app.use("/api/sales", salesRoutes);

console.log("Registering /api/reports...");
app.use("/api/reports", reportRoutes);

console.log("Registering /api/user...");
app.use("/api/user", userRoutes);

console.log("Registering /api/user preferences...");
app.use("/api/user/preferences", userPrefRoutes);


// ==================== USSD ROUTE (CRITICAL FIX) ====================
// Africa's Talking MUST call this exact path
app.use("/api/ussd", ussdRoutes);
app.use("/ussd", ussdRoutes); // Add root mount for gateway compatibility


// ==================== SMS ROUTE ====================
app.use("/api/sms", smsRoutes);


// ==================== INTERNAL ROUTES ====================
app.use("/api/internal/ussd", internalRoutes);


// ==================== ORDERS ROUTE ====================
console.log("Registering /api/orders...");
app.use("/api/orders", orderRoutes);

console.log("Registering /api/contacts...");
app.use("/api/contacts", contactRoutes);

console.log("Registering /api/notifications...");
app.use("/api/notifications", notificationRoutes);


console.log("Registering /api/payment...");
app.use("/api/payment", paymentRoutes);

console.log("Registering /api/merchants...");
app.use("/api/merchants", merchantRoutes);

console.log("Registering /api/negotiations...");
const negotiationRoutes = require("./routes/negotiations");
app.use("/api/negotiations", negotiationRoutes);


// ==================== SAFE ROUTE LISTING ====================
function listRoutes() {
  try {
    if (!app._router) return;

    console.log("\n📌 Registered Routes:");

    app._router.stack.forEach((middleware) => {

      if (middleware.route) {
        const methods = Object.keys(middleware.route.methods)
          .join(',')
          .toUpperCase();

        console.log(`${methods} ${middleware.route.path}`);
      }

      else if (middleware.name === "router" && middleware.handle.stack) {

        middleware.handle.stack.forEach(handler => {

          if (handler.route) {

            const methods = Object.keys(handler.route.methods)
              .join(',')
              .toUpperCase();

            console.log(`${methods} ${handler.route.path}`);

          }

        });

      }

    });

  } catch (err) {
    console.log("Route listing skipped");
  }
}


// ==================== 404 HANDLER ====================
app.use((req, res) => {

  console.log(`[404] ${req.method} ${req.originalUrl}`);

  if (req.originalUrl.startsWith("/api/")) {
    return res.status(404).json({
      success: false,
      message: `API route not found: ${req.originalUrl}`
    });
  }

  res.status(404).send("Not Found");

});


// ==================== GLOBAL ERROR HANDLER ====================
app.use((err, req, res, next) => {

  console.error("Global Error:", err.stack);

  res.status(500).json({
    success: false,
    message: "Something went wrong"
  });

});


// ==================== START SERVER ====================
const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ SHELVES Backend running on port ${PORT}`);
      setTimeout(listRoutes, 1000);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed — server cannot start:", err.message);
    process.exit(1);
  });
