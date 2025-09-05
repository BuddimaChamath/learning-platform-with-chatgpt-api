import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/courses');
  };

  return (
    <header className="header">
      <nav className="navbar">
        <div className="nav-brand">
          <Link to="/courses" className="brand-link">
            Learning Platform
          </Link>
        </div>

        <div className="nav-links">
          <Link to="/courses" className="nav-link">
            Courses
          </Link>

          {isAuthenticated ? (
            <>
              {user?.role === 'student' && (
                <>
                  <Link to="/dashboard" className="nav-link">
                    My Courses
                  </Link>
                  <Link to="/recommendations" className="nav-link">
                    Get Recommendations
                  </Link>
                </>
              )}

              {user?.role === 'instructor' && (
                <Link to="/instructor/dashboard" className="nav-link">
                  Dashboard
                </Link>
              )}

              <div className="user-menu">
                <span className="user-name">Hi, {user?.username}!</span>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-link register-btn">
                Register
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;