import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Layout/Header';
import LandingPage from './components/Layout/LandingPage';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import CourseList from './components/Courses/CourseList';
import CourseDetails from './components/Courses/CourseDetails';
import StudentDashboard from './components/Dashboard/StudentDashboard';
import InstructorDashboard from './components/Dashboard/InstructorDashboard';
import CourseRecommendations from './components/Recommendations/CourseRecommendations';
import ProtectedRoute from './components/Common/ProtectedRoute';
import EditCourse from './components/Courses/EditCourse';
import './App.css';
import './components/Layout/LandingPage.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
              {/* Landing Page */}
              <Route path="/" element={<LandingPage />} />
              
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/courses" element={<CourseList />} />
              <Route path="/courses/:id" element={<CourseDetails />} />

              {/* Protected Routes - Students */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute role="student">
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recommendations"
                element={
                  <ProtectedRoute role="student">
                    <CourseRecommendations />
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes - Instructors */}
              <Route
                path="/instructor/dashboard"
                element={
                  <ProtectedRoute role="instructor">
                    <InstructorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                  path="/instructor/courses/:id/edit"
                  element={
                    <ProtectedRoute role="instructor">
                      <EditCourse />
                    </ProtectedRoute>
                  }
                />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;