require("dotenv").config();
const mongoose = require("mongoose");
const Contact = require("../models/Contact");
const { toLocalPhone } = require("../utils/phone");

async function mergeContacts() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");

        const contacts = await Contact.find({});
        console.log(`Found ${contacts.length} total contacts.`);

        // Group contacts by Merchant ID and normalized local phone
        const groupedContacts = {};

        contacts.forEach(contact => {
            const merchantId = String(contact.merchantId);
            const originalPhone = contact.phone || "";
            const localPhone = toLocalPhone(originalPhone);

            // Skip invalid or empty numbers
            if (!localPhone) return;

            const groupKey = `${merchantId}_${localPhone}`;

            if (!groupedContacts[groupKey]) {
                groupedContacts[groupKey] = [];
            }
            groupedContacts[groupKey].push(contact);
        });

        let mergedCount = 0;
        let deletedCount = 0;
        let singleUpdatedCount = 0;

        for (const [groupKey, group] of Object.entries(groupedContacts)) {
            if (group.length > 1) {
                // We have duplicates
                console.log(`\nFound group of ${group.length} duplicates for key: ${groupKey}`);

                let totalOrders = 0;
                let latestOrderDate = new Date(0);
                let bestName = "";

                // Sort by creation or last order date to keep the oldest document as the primary one, 
                // but merge the best data into it.
                group.sort((a, b) => {
                    const dateA = a.lastOrderDate || a.createdAt || new Date(0);
                    const dateB = b.lastOrderDate || b.createdAt || new Date(0);
                    return dateA - dateB;
                });

                const primaryContact = group[0];
                const duplicatesToRemove = group.slice(1);

                group.forEach(c => {
                    totalOrders += (c.totalOrders || 0);

                    if (c.lastOrderDate && c.lastOrderDate > latestOrderDate) {
                        latestOrderDate = c.lastOrderDate;
                    }

                    if (c.name && c.name.trim() !== "") {
                        bestName = c.name;
                    }
                });

                // Update primary contact
                primaryContact.phone = toLocalPhone(primaryContact.phone); // Ensure local string
                primaryContact.totalOrders = totalOrders;
                if (latestOrderDate.getTime() > 0) {
                    primaryContact.lastOrderDate = latestOrderDate;
                }
                if (bestName) {
                    primaryContact.name = bestName;
                }

                await primaryContact.save();
                mergedCount++;

                // Delete the rest
                for (const dup of duplicatesToRemove) {
                    await Contact.findByIdAndDelete(dup._id);
                    deletedCount++;
                }

                console.log(`Merged into primary ID: ${primaryContact._id}, deleted ${duplicatesToRemove.length} duplicates.`);

            } else {
                // Only 1 contact in this group, ensure it's normalized in the DB
                const contact = group[0];
                const localPhone = toLocalPhone(contact.phone);

                if (contact.phone !== localPhone) {
                    contact.phone = localPhone;
                    await contact.save();
                    singleUpdatedCount++;
                }
            }
        }

        console.log("\n--- MIGRATION COMPLETE ---");
        console.log(`Merged Contact Groups: ${mergedCount}`);
        console.log(`Deleted Duplicates: ${deletedCount}`);
        console.log(`Single Contacts Normalized: ${singleUpdatedCount}`);

    } catch (err) {
        console.error("Migration Error:", err);
    } finally {
        process.exit(0);
    }
}

mergeContacts();
