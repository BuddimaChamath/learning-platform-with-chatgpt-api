# 🎓 AI-Powered Online Learning Platform

> A modern full-stack learning platform with intelligent course recommendations powered by OpenAI GPT-3

## ✨ Key Features

- 🔐 **Secure Authentication** - JWT-based auth with role management (Student/Instructor)
- 📚 **Course Management** - Full CRUD operations for course creation and enrollment  
- 🤖 **AI Recommendations** - GPT-3 powered course suggestions via chat interface
- 🔍 **Smart Search** - Real-time filtering by category, level, and keywords
- 📱 **Responsive Design** - Mobile-first approach with Tailwind CSS
- 👨‍🏫 **Instructor Dashboard** - Analytics and student management tools

## 🚀 Quick Start

### Prerequisites
- Node.js 16+, MongoDB Atlas account, OpenAI API key

### Installation
```bash
# Clone repository
git clone https://github.com/yourusername/learning-platform.git
cd learning-platform

# Backend setup
cd backend
npm install
cp .env.example .env  # Add your MongoDB URI, JWT secret, OpenAI key
npm run dev

# Frontend setup (new terminal)
cd frontend  
npm install
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
npm start
```

Visit `http://localhost:3000` to see the app! 🎉

## 🛠️ Tech Stack

**Frontend:** React 18, Tailwind CSS, Context API, React Router  
**Backend:** Node.js, Express, MongoDB, Mongoose, JWT  
**AI:** OpenAI GPT-3.5 Turbo  
**Deployment:** Vercel (Frontend), Railway (Backend), MongoDB Atlas


## 🏗️ Project Structure

```
learning-platform/
├── backend/
│   ├── controllers/     # Business logic
│   ├── models/         # Database schemas  
│   ├── routes/         # API endpoints
│   └── middleware/     # Auth & validation
└── frontend/
    ├── components/     # Reusable UI components
    ├── context/       # State management
    └── services/      # API calls
```

## 🔑 Key API Endpoints

```bash
# Authentication
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
GET  /api/auth/me          # Get current user

# Courses  
GET  /api/courses                    # Browse courses (public)
POST /api/courses/:id/enroll         # Enroll in course (student)
POST /api/courses                    # Create course (instructor)
GET  /api/courses/instructor/my-courses  # Instructor courses

# AI Recommendations
POST /api/recommendations   # Get AI course suggestions (student)
GET  /api/recommendations/usage  # Check API usage
```

## 🌍 Environment Setup

**Backend (.env)**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/learning-platform
JWT_SECRET=your-super-secret-jwt-key
OPENAI_API_KEY=sk-your-openai-api-key
```

**Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:5000/api
```


## 📋 Features Overview

### For Students
- Browse and search course catalog
- Get AI-powered course recommendations
- Enroll in courses and track progress
- Interactive chat with AI assistant
- Personal dashboard with enrolled courses

### For Instructors
- Create and manage courses
- View student enrollments and analytics
- Edit course content and details
- Monitor course performance
- Role-based dashboard access

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT authentication with 7-day expiration
- Role-based access control (RBAC)
- Input validation and sanitization
- CORS protection
- API rate limiting

## 📊 AI Integration

- **OpenAI GPT-3.5 Turbo** for intelligent recommendations
- **Usage tracking** with 250 requests/month limit
- **Conversation memory** for contextual responses
- **Error handling** with graceful fallbacks
- **Personalized suggestions** based on user goals

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request


---

⭐ **Star this repository if you found it helpful!**

**Made with ❤️ by [Your Name]**
