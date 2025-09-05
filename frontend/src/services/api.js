import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

// Course API calls
export const courseAPI = {
  getAllCourses: (params) => api.get('/courses', { params }),
  getCourse: (id) => api.get(`/courses/${id}`),
  createCourse: (courseData) => api.post('/courses', courseData),
  updateCourse: (id, courseData) => api.put(`/courses/${id}`, courseData),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  getInstructorCourses: () => api.get('/courses/instructor/my-courses'),
  enrollInCourse: (id) => api.post(`/courses/${id}/enroll`),
  getEnrolledCourses: () => api.get('/courses/enrolled/my-courses'),
  unenrollFromCourse: (id) => api.delete(`/courses/${id}/enroll`),
};

// Recommendation API calls
export const recommendationAPI = {
  getRecommendations: (prompt) => api.post('/recommendations', { prompt }),
  getAPIUsage: () => api.get('/recommendations/usage'),
};

// NEW: Chat API calls
export const chatAPI = {
  // Get user's chat history
  getChatHistory: async () => {
    const response = await api.get('/chat');
    return response.messages;
  },
  
  // Save chat messages
  saveChatHistory: async (messages) => {
    return await api.post('/chat', { messages });
  },
  
  // Clear chat history
  clearChatHistory: async () => {
    return await api.delete('/chat');
  }
};

export default api;