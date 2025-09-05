const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Learning Platform API is running!',
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', service: 'Learning Platform API' });
});

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const courseRoutes = require('./routes/courses');
app.use('/api/courses', courseRoutes);

const recommendationRoutes = require('./routes/recommendations');
app.use('/api/recommendations', recommendationRoutes);

const chatRoutes = require('./routes/chat');
app.use('/api/chat', chatRoutes);

module.exports = app;