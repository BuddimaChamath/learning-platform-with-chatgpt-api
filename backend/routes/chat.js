const express = require('express');
const Chat = require('../models/Chat');
const { protect } = require('../middleware/auth');
const router = express.Router();

// All chat routes require authentication
router.use(protect);

// GET /api/chat - Get user's chat history
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;
    
    let chat = await Chat.findOne({ userId });
    
    if (!chat) {
      // Create new chat with default welcome message
      chat = new Chat({
        userId,
        messages: [
          {
            id: 1,
            type: 'bot',
            content: "👋 Hi there! I'm your AI learning assistant. Tell me about your career goals, interests, or what you'd like to learn, and I'll recommend the perfect courses for you!",
            timestamp: new Date()
          }
        ]
      });
      await chat.save();
    }
    
    res.json({
      success: true,
      messages: chat.messages
    });
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat history'
    });
  }
});

// POST /api/chat - Save/update chat messages
router.post('/', async (req, res) => {
  try {
    const userId = req.user._id;
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        error: 'Messages array is required'
      });
    }
    
    // Find or create chat
    let chat = await Chat.findOne({ userId });
    
    if (!chat) {
      chat = new Chat({ userId, messages });
    } else {
      chat.messages = messages;
    }
    
    await chat.save();
    
    res.json({
      success: true,
      message: 'Chat saved successfully',
      messageCount: chat.messages.length
    });
  } catch (error) {
    console.error('Error saving chat:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save chat'
    });
  }
});

// DELETE /api/chat - Clear chat history
router.delete('/', async (req, res) => {
  try {
    const userId = req.user._id;
    
    const defaultMessage = {
      id: 1,
      type: 'bot',
      content: "👋 Hi there! I'm your AI learning assistant. Tell me about your career goals, interests, or what you'd like to learn, and I'll recommend the perfect courses for you!",
      timestamp: new Date()
    };
    
    await Chat.findOneAndUpdate(
      { userId },
      { messages: [defaultMessage] },
      { upsert: true }
    );
    
    res.json({
      success: true,
      message: 'Chat history cleared'
    });
  } catch (error) {
    console.error('Error clearing chat:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear chat'
    });
  }
});

module.exports = router;