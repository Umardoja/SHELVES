require("dotenv").config();
const { sendSMS } = require("../services/smsService");

async function testSMS() {
    console.log("=== Testing Africa's Talking LIVE API ===");
    // You would replace this with your actual phone number to test
    // However, I will use a placeholder or my own assigned test number for validation logging
    const testNumber = "09028530184";
    console.log(`Sending to: ${testNumber}`);

    try {
        const response = await sendSMS(testNumber, "UPSTOCK LIVE API Test. Reply NO to stop.");
        console.log("Full SMS Response:");
        console.log(JSON.stringify(response, null, 2));
    } catch (e) {
        console.error("Test Script Error:", e.message);
    }
}

testSMS();
