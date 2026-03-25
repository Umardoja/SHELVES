const { normalizePhoneNumber } = require("./utils/phone");

/**
 * Test cases to verify phone normalization works correctly
 * across all formats
 */

console.log("🧪 Testing Phone Normalization\n");
console.log("================================\n");

const testCases = [
  {
    input: "09030194735",
    expected: "+2349030194735",
    description: "Nigerian format without country code"
  },
  {
    input: "2349030194735",
    expected: "+2349030194735",
    description: "Nigerian format with country code (no +)"
  },
  {
    input: "+2349030194735",
    expected: "+2349030194735",
    description: "International format (already correct)"
  },
  {
    input: "+234 903 019 4735",
    expected: "+2349030194735",
    description: "International format with spaces"
  },
  {
    input: "0 903 019 4735",
    expected: "+2349030194735",
    description: "Local format with spaces"
  },
  {
    input: "234-903-019-4735",
    expected: "+2349030194735",
    description: "Country code with dashes"
  },
  {
    input: "+234-903-019-4735",
    expected: "+2349030194735",
    description: "International format with dashes"
  },
  {
    input: null,
    expected: null,
    description: "Null input"
  },
  {
    input: "",
    expected: "",
    description: "Empty string"
  },
  {
    input: "+1234567890",
    expected: "+1234567890",
    description: "Non-Nigerian number (preserved as-is)"
  },
];

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  const result = normalizePhoneNumber(testCase.input);
  const isPass = result === testCase.expected;

  if (isPass) {
    passed++;
    console.log(`✅ Test ${index + 1}: PASS`);
  } else {
    failed++;
    console.log(`❌ Test ${index + 1}: FAIL`);
  }

  console.log(`   Description: ${testCase.description}`);
  console.log(`   Input:       ${JSON.stringify(testCase.input)}`);
  console.log(`   Expected:    ${JSON.stringify(testCase.expected)}`);
  console.log(`   Got:         ${JSON.stringify(result)}`);
  console.log();
});

console.log("================================");
console.log(`📊 Summary: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);

if (failed === 0) {
  console.log("✅ All tests passed!");
  process.exit(0);
} else {
  console.log(`❌ ${failed} test(s) failed!`);
  process.exit(1);
}
