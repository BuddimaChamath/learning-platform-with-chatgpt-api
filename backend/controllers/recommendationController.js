const Course = require('../models/Course');
const OpenAI = require("openai");
const fs = require('fs').promises;
const path = require('path');

// Initialize OpenAI client with the assessment API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Put the provided key in your .env file
});

const MAX_API_REQUESTS = 250; // Assessment limit
const API_USAGE_FILE = path.join(__dirname, '../data/api-usage.json');

// ASSESSMENT SAFE: Persistent file-based API tracking
const getAPIUsage = async () => {
  try {
    const data = await fs.readFile(API_USAGE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist, create initial data
    const initialData = {
      count: 0,
      requests: [],
      startDate: new Date().toISOString()
    };
    await saveAPIUsage(initialData);
    return initialData;
  }
};

const saveAPIUsage = async (data) => {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(API_USAGE_FILE);
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(API_USAGE_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Failed to save API usage:', error);
  }
};

// ASSESSMENT SAFE: Log each request with details
const logAPIRequest = async (userId, prompt, success = true, error = null) => {
  const usage = await getAPIUsage();
  usage.requests.push({
    timestamp: new Date().toISOString(),
    userId,
    prompt: prompt.substring(0, 100), // Log first 100 chars
    success,
    error: error ? error.message : null
  });
  if (success) {
    usage.count += 1;
  }
  await saveAPIUsage(usage);
  return usage;
};

// Get course recommendations using GPT (ASSESSMENT OPTIMIZED)
exports.getCourseRecommendations = async (req, res) => {
  try {
    const { prompt } = req.body;
    const userId = req.user.id; // From auth middleware
    
    // Strict input validation
    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a prompt for course recommendations",
      });
    }

    // Prevent long prompts that waste tokens
    if (prompt.length > 200) {
      return res.status(400).json({
        success: false,
        message: "Prompt too long. Please keep it under 200 characters for efficiency.",
      });
    }

    // CRITICAL: Check API limit before making request
    const currentUsage = await getAPIUsage();
    if (currentUsage.count >= MAX_API_REQUESTS) {
      return res.status(429).json({
        success: false,
        message: `Assessment API limit of ${MAX_API_REQUESTS} requests exceeded.`,
        totalRequestsUsed: currentUsage.count,
        requestLog: currentUsage.requests.slice(-5) // Last 5 requests
      });
    }

    // Get limited courses to minimize token usage
    const availableCourses = await Course.find({ isPublished: true })
      .select("title category level") // Minimal fields only
      .limit(15) // Strict limit for assessment
      .lean();

    if (availableCourses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No courses available."
      });
    }

    // OPTIMIZED: Very concise course list to save tokens
    const courseList = availableCourses
      .map(course => `${course.title} (${course.category})`)
      .join(", ");

    // ASSESSMENT OPTIMIZED: Minimal system prompt to save tokens
    const systemPrompt = `Recommend 3-4 relevant courses from: ${courseList}. 
Based on: "${prompt}"
Format: Course Name - Brief reason (1 line each)`;

    console.log(`🔥 MAKING API REQUEST ${currentUsage.count + 1}/${MAX_API_REQUESTS}`);
    console.log(`📝 Prompt: ${prompt}`);

    // Make OpenAI request with minimal token usage
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: 200, // Very conservative for assessment
      temperature: 0.7,
    });

    // Log successful request
    const updatedUsage = await logAPIRequest(userId, prompt, true);

    const recommendation = response.choices[0].message.content;

    // Find matched courses
    const recommendedCourses = availableCourses.filter((course) =>
      recommendation.toLowerCase().includes(course.title.toLowerCase())
    );

    console.log(`✅ SUCCESS! Requests used: ${updatedUsage.count}/${MAX_API_REQUESTS}`);

    res.json({
      success: true,
      recommendation,
      recommendedCourses,
      apiStats: {
        requestsUsed: updatedUsage.count,
        requestsRemaining: MAX_API_REQUESTS - updatedUsage.count,
        maxRequests: MAX_API_REQUESTS
      }
    });

  } catch (error) {
    console.error("❌ OpenAI Error:", error);

    // Log failed request
    const userId = req.user?.id || 'unknown';
    await logAPIRequest(userId, req.body?.prompt || 'unknown', false, error);

    // Handle specific OpenAI errors
    if (error.code === 'insufficient_quota') {
      return res.status(402).json({
        success: false,
        message: "OpenAI API quota exceeded. Assessment limit reached."
      });
    }

    if (error.code === 'rate_limit_exceeded') {
      return res.status(429).json({
        success: false,
        message: "Rate limit exceeded. Please wait before trying again."
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch recommendations",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ASSESSMENT: Detailed API usage stats for monitoring
exports.getAPIUsage = async (req, res) => {
  try {
    const usage = await getAPIUsage();
    
    res.json({
      success: true,
      apiRequestsUsed: usage.count,
      apiRequestsRemaining: MAX_API_REQUESTS - usage.count,
      maxRequests: MAX_API_REQUESTS,
      startDate: usage.startDate,
      recentRequests: usage.requests.slice(-10), // Last 10 requests
      warningLevel: usage.count > 200 ? 'HIGH' : usage.count > 150 ? 'MEDIUM' : 'LOW'
    });
  } catch (error) {
    console.error('Failed to get API usage:', error);
    res.status(500).json({
      success: false,
      message: "Failed to get API usage stats"
    });
  }
};

// ASSESSMENT: Reset counter (use carefully!)
exports.resetAPIUsage = async (req, res) => {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        success: false,
        message: "Reset only allowed in development mode"
      });
    }

    const resetData = {
      count: 0,
      requests: [],
      startDate: new Date().toISOString(),
      lastReset: new Date().toISOString()
    };
    
    await saveAPIUsage(resetData);
    
    res.json({
      success: true,
      message: "API usage counter reset successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reset API usage"
    });
  }
};