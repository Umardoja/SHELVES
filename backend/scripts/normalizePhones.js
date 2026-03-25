const mongoose = require("mongoose");
require("dotenv").config();

const Merchant = require("../models/Merchant");
const { normalizePhoneNumber } = require("../utils/phone");

const normalizePhones = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Fetch all merchants
    const merchants = await Merchant.find();
    console.log(`📋 Found ${merchants.length} merchants`);

    // Map to track normalized phones and their original documents
    const phoneMap = new Map();
    const duplicates = [];

    // First pass: identify duplicates
    for (const merchant of merchants) {
      const normalized = normalizePhoneNumber(merchant.phone);

      if (phoneMap.has(normalized)) {
        // Duplicate found
        duplicates.push({
          duplicate: merchant._id,
          keepId: phoneMap.get(normalized)._id,
          phone: normalized,
          duplicateBusinessName: merchant.businessName,
          keepBusinessName: phoneMap.get(normalized).businessName
        });
      } else {
        // First occurrence of this normalized phone
        phoneMap.set(normalized, merchant);
      }
    }

    if (duplicates.length > 0) {
      console.log(`\n⚠️  Found ${duplicates.length} duplicate merchants:`);
      duplicates.forEach(dup => {
        console.log(
          `   - ${dup.duplicateBusinessName} (${dup.phone}) is duplicate of ${dup.keepBusinessName}`
        );
      });
    } else {
      console.log("\n✅ No duplicates found");
    }

    // Second pass: normalize all phones and handle duplicates
    let updated = 0;
    let deleted = 0;

    for (const [normalized, merchant] of phoneMap) {
      // Check if phone needs normalization
      if (merchant.phone !== normalized) {
        await Merchant.updateOne(
          { _id: merchant._id },
          { phone: normalized }
        );
        updated++;
        console.log(
          `   ✏️  Normalized: ${merchant.phone} → ${normalized}`
        );
      }
    }

    // Delete duplicates
    for (const dup of duplicates) {
      await Merchant.deleteOne({ _id: dup.duplicate });
      deleted++;
      console.log(`   🗑️  Deleted duplicate merchant: ${dup.duplicateBusinessName}`);
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`   • Updated: ${updated} merchants`);
    console.log(`   • Deleted: ${deleted} duplicates`);
    console.log(`   • Total Merchants After: ${merchants.length - deleted}`);

    // Verify unique constraint
    const finalMerchants = await Merchant.find();
    const finalPhones = new Set();
    let constraintViolations = 0;

    for (const merchant of finalMerchants) {
      if (finalPhones.has(merchant.phone)) {
        console.log(`   ⚠️  CONSTRAINT VIOLATION: ${merchant.phone}`);
        constraintViolations++;
      }
      finalPhones.add(merchant.phone);
    }

    if (constraintViolations === 0) {
      console.log(`   ✅ All phone numbers are unique`);
    }

    console.log("\n✅ Phone normalization migration completed!");

  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
};

// Run migration
normalizePhones();
