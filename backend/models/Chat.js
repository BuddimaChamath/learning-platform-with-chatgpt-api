const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['user', 'bot'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  courses: [{
    _id: String,
    title: String,
    description: String,
    category: String,
    level: String
  }],
  error: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // One chat per user
  },
  messages: [messageSchema],
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update lastActivity when messages are modified
chatSchema.pre('save', function() {
  this.lastActivity = new Date();
});

module.exports = mongoose.model('Chat', chatSchema);