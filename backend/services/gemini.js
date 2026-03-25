const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function askAI(prompt) {
  console.log("AI prompt:", prompt);
  return "Hello! This is a demo response from AI.";
}


module.exports = { askAI };
