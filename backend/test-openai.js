require("dotenv").config();
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function testOpenAI() {
  console.log("🧪 Testing OpenAI API Connection...\n");
  
  try {
    console.log("🔄 Sending test request to OpenAI...");
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a sports expert. Respond with a simple JSON array."
        },
        {
          role: "user",
          content: `Generate 3 sports training tips for cricket players. 
          Return ONLY a JSON array like this:
          [
            {"title": "Tip 1", "description": "Details", "category": "Technique"},
            {"title": "Tip 2", "description": "Details", "category": "Fitness"},
            {"title": "Tip 3", "description": "Details", "category": "Strategy"}
          ]
          Return ONLY the JSON array, no other text.`
        }
      ],
      temperature: 0.5,
      max_tokens: 500
    });

    console.log("✅ OpenAI API Response Received!\n");
    console.log("Response:", response.choices[0].message.content);
    
    // Try to parse as JSON
    try {
      const parsed = JSON.parse(response.choices[0].message.content);
      console.log("\n✅ Successfully parsed as JSON");
      console.log("Data:", JSON.stringify(parsed, null, 2));
    } catch (parseErr) {
      console.log("\n⚠️ Response is not valid JSON");
      console.log("Raw response:", response.choices[0].message.content);
    }

  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      console.log(`❌ OpenAI API Error: ${error.status} ${error.message}`);
      console.log("Details:", error);
    } else if (error instanceof OpenAI.APIConnectionError) {
      console.log(`❌ Failed to connect to OpenAI API: ${error.message}`);
      console.log("Check your internet connection and API endpoint.");
    } else if (error instanceof OpenAI.RateLimitError) {
      console.log(`❌ OpenAI API rate limit exceeded: ${error.message}`);
      console.log("Please wait and retry.");
    } else {
      console.log(`❌ Unexpected error: ${error.message}`);
      console.log("Error type:", error.constructor.name);
    }
  }
}

testOpenAI();
