require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testModels() {
  const modelsToTest = [
    "gemini-1.5-flash",
    "gemini-pro",
    "gemini-2.0-flash",
    "gemini-2.0-flash-exp",
    "gemini-1.5-pro"
  ];

  console.log("🧪 Testing available Gemini models...\n");

  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      // Try a simple request
      const result = await model.generateContent("Say 'Hello'");
      const response = await result.response;
      console.log(`✅ ${modelName} is AVAILABLE\n`);
    } catch (error) {
      console.log(`❌ ${modelName} failed: ${error.message}\n`);
    }
  }
}

testModels();
