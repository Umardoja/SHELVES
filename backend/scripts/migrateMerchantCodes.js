require("dotenv").config();
const mongoose = require("mongoose");
const Merchant = require("../models/Merchant");
const db = require("../services/database");

async function migrateMerchantCodes() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB...");

        const merchantsWithoutCode = await Merchant.find({ merchantCode: { $exists: false } });
        console.log(`Found ${merchantsWithoutCode.length} merchants without a code.`);

        for (const merchant of merchantsWithoutCode) {
            const code = await db.generateMerchantCode(merchant.businessName);
            merchant.merchantCode = code;
            await merchant.save();
            console.log(`Assigned code ${code} to ${merchant.businessName} (${merchant._id})`);
        }

        const merchantsWithNull = await Merchant.find({ merchantCode: null });
        console.log(`Found ${merchantsWithNull.length} merchants with null code.`);
        for (const merchant of merchantsWithNull) {
            const code = await db.generateMerchantCode(merchant.businessName);
            merchant.merchantCode = code;
            await merchant.save();
            console.log(`Assigned code ${code} to ${merchant.businessName} (${merchant._id})`);
        }

        console.log("Migration finished.");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

migrateMerchantCodes();
