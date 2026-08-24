const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai");
const authMiddleware = require("../middleware/authMiddleware");
const { asyncHandler } = require("../utils/errorHandler");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize OpenAI (fallback)
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

/* ===== GEMINI HELPER ===== */
async function tryGemini(prompt) {
  try {
    const modelsToTry = ["gemini-1.5-flash", "gemini-pro", "gemini-2.0-flash"];
    
    for (const modelName of modelsToTry) {
      try {
        console.log(`🔄 Trying Gemini model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("✅ Received response from Gemini:", modelName, "length:", text.length);

        if (!text || text.trim().length === 0) {
          console.log("⚠️ Empty response from model:", modelName);
          continue;
        }

        // Parse JSON
        let recommendations;
        try {
          recommendations = JSON.parse(text);
        } catch (parseError) {
          console.log("⚠️ JSON parse failed for", modelName, "attempting regex extraction...");
          const jsonMatch = text.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            try {
              recommendations = JSON.parse(jsonMatch[0]);
            } catch (e) {
              console.log("❌ Regex extraction failed");
              continue;
            }
          } else {
            console.log("❌ No JSON array found");
            continue;
          }
        }

        if (!Array.isArray(recommendations)) {
          console.log("⚠️ Response is not an array");
          continue;
        }

        if (recommendations.length === 0) {
          console.log("⚠️ Empty recommendations array from", modelName);
          continue;
        }

        console.log("✅ Successfully parsed", recommendations.length, "recommendations from Gemini");
        return { success: true, recommendations };
      } catch (modelError) {
        console.log(`⚠️ Gemini model ${modelName} error:`, modelError.message.substring(0, 100));
      }
    }
    
    return { success: false, error: "All Gemini models failed or not available" };
  } catch (error) {
    console.error("❌ Gemini helper error:", error.message);
    return { success: false, error: error.message };
  }
}

/* ===== OPENAI HELPER ===== */
async function tryOpenAI(prompt) {
  try {
    if (!openai) {
      console.log("❌ OpenAI client not initialized (no API key)");
      return { success: false, error: "OpenAI API key not configured" };
    }

    console.log("🔄 Trying OpenAI API with gpt-4o-mini...");
    
    // Create a focused JSON-only prompt for better results
    const jsonPrompt = prompt + `

    IMPORTANT: Your response MUST be ONLY a valid JSON array. No explanations, no markdown, no code blocks. Just the JSON array.
    Start with [ and end with ]. Every object must have "title", "description", and "category" fields.`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a sports expert. Respond ONLY with valid JSON arrays. No markdown. No code blocks. Just pure JSON."
        },
        {
          role: "user",
          content: jsonPrompt
        }
      ],
      temperature: 0.5,
      max_tokens: 2000
    });

    const text = response.choices[0]?.message?.content || "";
    console.log("✅ Received response from OpenAI, length:", text.length);
    console.log("📄 Response preview:", text.substring(0, 200));

    if (!text || text.trim().length === 0) {
      console.log("⚠️ Empty response from OpenAI");
      return { success: false, error: "Empty response from OpenAI" };
    }

    // Parse JSON
    let recommendations;
    try {
      recommendations = JSON.parse(text);
    } catch (parseError) {
      console.log("⚠️ JSON parse failed, attempting regex extraction...");
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          recommendations = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.log("❌ Regex extraction failed:", e.message);
          return { success: false, error: "Could not parse JSON from OpenAI response" };
        }
      } else {
        console.log("❌ No JSON array found in response");
        console.log("Full response:", text);
        return { success: false, error: "No JSON array in response" };
      }
    }

    if (!Array.isArray(recommendations)) {
      console.log("❌ OpenAI response is not an array, type:", typeof recommendations);
      return { success: false, error: "Response is not a JSON array" };
    }

    if (recommendations.length === 0) {
      console.log("⚠️ OpenAI returned empty array");
      return { success: false, error: "Empty recommendations array" };
    }

    console.log("✅ Successfully parsed", recommendations.length, "recommendations from OpenAI");
    return { success: true, recommendations };
  } catch (error) {
    console.error("❌ OpenAI Error:", error.message);
    if (error.response) {
      console.error("Error status:", error.response.status);
      console.error("Error data:", error.response.data);
    }
    return { success: false, error: error.message };
  }
}

/* ===== DEMO DATA GENERATOR (Fallback) ===== */
function generateDemoRecommendations(sport, userRole, isSearchMode) {
  const demoData = {
    Cricket: {
      player: [
        { title: "Perfect Your Batting Stance", description: "Work on your stance to maintain balance and improve shot accuracy. Practice against different bowling styles.", category: "Technique" },
        { title: "Bowling Pace Development", description: "Focus on run-up consistency and release technique to increase bowling speed safely.", category: "Fitness" },
        { title: "Field Positioning Awareness", description: "Study fielding positions and anticipate ball direction to improve catch rates.", category: "Strategy" }
      ],
      coach: [
        { title: "Team Rotation Strategy", description: "Plan player rotations to manage workload and maintain peak performance throughout the season.", category: "Strategy" },
        { title: "Fitness Conditioning Program", description: "Design specialized conditioning programs for different playing roles.", category: "Fitness" },
        { title: "Match Analysis Process", description: "Implement systematic match analysis to identify opponent weaknesses.", category: "Mental" }
      ],
      scout: [
        { title: "Batting Average Analysis", description: "Evaluate players based on consistency and performance against quality bowling.", category: "Insight" },
        { title: "Fielding Metrics", description: "Assess fielding skills through catch rate, throw accuracy, and positioning.", category: "Fact" }
      ]
    },
    Football: {
      player: [
        { title: "Ball Control Drills", description: "Practice first-touch control and dribbling to maintain possession in pressure situations.", category: "Technique" },
        { title: "Positional Fitness", description: "Build position-specific fitness requirements for optimal performance.", category: "Fitness" },
        { title: "Tactical Awareness", description: "Develop game reading skills to anticipate opponent movements.", category: "Strategy" }
      ],
      coach: [
        { title: "Formation Flexibility", description: "Master multiple formations to adapt to different opponent strategies.", category: "Strategy" },
        { title: "Player Development Pipeline", description: "Create structured programs for youth player development.", category: "Mental" },
        { title: "Recovery Management", description: "Implement proper recovery protocols between matches.", category: "Fitness" }
      ],
      scout: [
        { title: "Player Movement Analysis", description: "Track player positioning and movement patterns during matches.", category: "Insight" },
        { title: "Pass Completion Metrics", description: "Evaluate passing accuracy and distribution effectiveness.", category: "Fact" }
      ]
    },
    Basketball: {
      player: [
        { title: "Shooting Form Perfection", description: "Develop consistent shooting mechanics for improved accuracy from all court areas.", category: "Technique" },
        { title: "Agility Training", description: "Build lateral movement and quick directional changes for better defense.", category: "Fitness" },
        { title: "Game IQ Development", description: "Study spacing, timing, and decision-making in various game situations.", category: "Mental" }
      ],
      coach: [
        { title: "Pick and Roll Defense", description: "Teach effective pick and roll defense strategies.", category: "Strategy" },
        { title: "Player Conditioning", description: "Develop cardio and strength training specific to basketball demands.", category: "Fitness" },
        { title: "Offensive Spacing", description: "Optimize floor spacing for better scoring opportunities.", category: "Strategy" }
      ],
      scout: [
        { title: "Three Point Shooting Efficiency", description: "Evaluate three-point shooting percentage and volume.", category: "Fact" },
        { title: "Defensive Rating Analysis", description: "Assess defensive impact and player positioning.", category: "Insight" }
      ]
    }
  };

  const sportData = demoData[sport] || demoData.Cricket;
  const recommendations = sportData[userRole] || sportData.player;
  
  return isSearchMode ? recommendations.slice(0, 2) : recommendations;
}

/* ===== MAIN ROUTE ===== */
router.post("/generate", authMiddleware, asyncHandler(async (req, res) => {
  const { sport, count = 5, type = "training" } = req.body;
  const userRole = req.user.role; 

  if (!sport || sport.trim().length < 2) {
    return res.status(400).json({ message: "Valid input is required" });
  }

  if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
    return res.status(500).json({ 
      message: "AI Service Error",
      error: "No API keys configured" 
    });
  }

  const isSearchMode = type === "search" || sport.split(" ").length > 3;

  let prompt;

  if (isSearchMode) {
    prompt = `
      You are an expert sports AI consultant. The user (${userRole}) has asked this specific question or topic: "${sport}".
      
      Provide a direct, conversational, and highly accurate answer. 
      Do NOT generate random drills unless specifically asked. 
      
      Split your answer into logical parts (paragraphs or key points).
      You MUST return ONLY a valid JSON array (no markdown, no code blocks, pure JSON) with this structure:
      [
        {
          "title": "A short heading for this part of the answer",
          "description": "The detailed content/answer text.",
          "category": "Insight" 
        }
      ]
      
      Keep the "category" as "Insight", "Fact", or "History" based on the content.
      Return ONLY the JSON array, nothing else.
    `;
  } else {
    const recommendationCount = Math.min(Math.max(1, Number(count)), 10);
    
    const rolePrompts = {
      player: `Generate ${recommendationCount} actionable training recommendations for ${sport} players. Focus on skills, fitness, and technique.`,
      coach: `Generate ${recommendationCount} coaching strategies for ${sport} coaches. Focus on team management and drills.`,
      scout: `Generate ${recommendationCount} scouting tips for ${sport}. Focus on talent identification.`,
      admin: `Generate ${recommendationCount} management tips for ${sport} programs.`
    };

    const basePrompt = rolePrompts[userRole] || rolePrompts.player;

    prompt = `
      ${basePrompt}
      You must return ONLY a valid JSON array (no markdown, no code blocks, pure JSON) with this structure:
      [
        {
          "title": "Brief title",
          "description": "Detailed description",
          "category": "Technique, Fitness, Mental, Strategy, or Nutrition"
        }
      ]
      Ensure recommendations are unique.
      Return ONLY the JSON array, nothing else.
    `;
  }

  // Generate content with fallback
  try {
    console.log("🚀 Generating recommendations for:", { sport, type, userRole });
    
    // Try Gemini first
    const geminiResult = await tryGemini(prompt);
    if (geminiResult.success) {
      return res.json({
        sport,
        recommendations: geminiResult.recommendations,
        count: geminiResult.recommendations.length,
        role: userRole,
        mode: isSearchMode ? "search" : "training",
        source: "gemini"
      });
    }

    // Fallback to OpenAI
    console.log("🔄 Gemini failed, trying OpenAI fallback...");
    const openaiResult = await tryOpenAI(prompt);
    if (openaiResult.success) {
      return res.json({
        sport,
        recommendations: openaiResult.recommendations,
        count: openaiResult.recommendations.length,
        role: userRole,
        mode: isSearchMode ? "search" : "training",
        source: "openai"
      });
    }

    // Fallback to demo mode if both fail
    console.log("⚠️ Both Gemini and OpenAI failed, returning demo data...");
    console.log("Gemini error:", geminiResult.error);
    console.log("OpenAI error:", openaiResult.error);
    const demoRecommendations = generateDemoRecommendations(sport, userRole, isSearchMode);
    return res.json({
      sport,
      recommendations: demoRecommendations,
      count: demoRecommendations.length,
      role: userRole,
      mode: isSearchMode ? "search" : "training",
      source: "demo"
    });

  } catch (error) {
    console.error("❌ Final Error:", error.message);
    return res.status(500).json({ 
      message: "AI Service Error",
      error: error.message 
    });
  }
}));

module.exports = router;
