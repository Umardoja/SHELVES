require("dotenv").config();
const mongoose = require("mongoose");
const Merchant = require("../models/Merchant");
const { normalizePhoneNumber } = require("../utils/phone");

// Re-implement generation logic securely outside the database service to prevent circular dependencies in script runner
async function generateStoreCode(businessName) {
    const prefix = (businessName || "MER")
        .replace(/[^a-zA-Z]/g, "")
        .substring(0, 3)
        .toUpperCase()
        .padEnd(3, "X");

    for (let attempt = 0; attempt < 20; attempt++) {
        const digits = String(Math.floor(100 + Math.random() * 900));
        const code = prefix + digits;
        const exists = await Merchant.findOne({ storeCode: code });
        if (!exists) return code;
    }
    return prefix + String(Math.floor(1000 + Math.random() * 9000));
}

async function runMigration() {
    console.log("🚀 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ connected.");

    console.log("🔍 Finding merchants needing a new storeCode format...");
    // Find all merchants (whether undefined, null, or missing)
    const merchants = await Merchant.find({
        $or: [{ storeCode: { $exists: false } }, { storeCode: null }]
    });

    console.log(`📌 Found ${merchants.length} merchants to upgrade.`);

    let successCount = 0;
    for (const mx of merchants) {
        try {
            const newCode = await generateStoreCode(mx.businessName);
            mx.storeCode = newCode;
            await mx.save();
            console.log(`✅ [${mx.phone}] ${mx.businessName} -> Assigned: ${newCode}`);
            successCount++;
        } catch (err) {
            console.error(`❌ Failed migrating [${mx.phone}]:`, err.message);
        }
    }

    console.log(`\n🎉 Migration Complete! Upgraded ${successCount}/${merchants.length} merchants successfully.`);
    process.exit(0);
}

runMigration();
