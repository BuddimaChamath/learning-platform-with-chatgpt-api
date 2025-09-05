const express = require('express');
const { 
  getCourseRecommendations, 
  getAPIUsage,
  resetAPIUsage
} = require('../controllers/recommendationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protected routes - Students only
router.use(protect); // All routes require authentication

// Get course recommendations
router.post('/', authorize('student'), getCourseRecommendations);

// Get API usage stats (for monitoring)
router.get('/usage', getAPIUsage);

// Reset API usage (development only)
router.post('/reset-usage', resetAPIUsage);

module.exports = router;