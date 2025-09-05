import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();


  const handleGetStarted = () => {
    if (isAuthenticated) {
      if (user?.role === 'instructor') {
        navigate('/instructor/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Online Learning Platform
              <span className="highlight"> with AI Course Recommendations</span>
            </h1>
            <p className="hero-description">
              Discover courses tailored to your career goals with our ChatGPT-powered recommendation system. 
              Learn from expert instructors and advance your skills.
            </p>
            
            <div className="hero-actions">
              <button onClick={handleGetStarted} className="btn btn-primary">
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
              </button>
              <Link to="/courses" className="btn btn-outline">
                Browse Courses
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Platform Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI Course Recommendations</h3>
              <p>Get personalized course suggestions powered by ChatGPT based on your career goals</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👨‍🏫</div>
              <h3>Expert Instructors</h3>
              <p>Learn from experienced professionals who create and manage quality courses</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3>Course Management</h3>
              <p>Easy enrollment system with progress tracking and course details</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎓</div>
              <h3>Student Dashboard</h3>
              <p>Track your enrolled courses and learning progress in one place</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Recommendation Preview */}
      <section className="ai-preview">
        <div className="container">
          <div className="ai-content">
            <div className="ai-text">
              <h2>Get Smart Course Recommendations</h2>
              <p>
                Tell our AI assistant about your career goals and get personalized course recommendations. 
                Try asking: "I want to be a software engineer, what courses should I follow?"
              </p>
              <Link to={isAuthenticated ? "/recommendations" : "/register"} className="btn btn-primary">
                Try AI Recommendations
              </Link>
            </div>
            <div className="ai-demo">
              <div className="chat-bubble user">
                "I want to be a software engineer, what courses should I follow?"
              </div>
              <div className="chat-bubble ai">
                Based on your goal, I recommend starting with JavaScript Fundamentals, 
                then React Development, and Node.js Backend Development...
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Start Learning?</h2>
            <p>Join our platform and discover courses that match your career aspirations</p>
            <div className="cta-buttons">
              {!isAuthenticated ? (
                <>
                  <Link to="/register" className="btn btn-primary">
                    Sign Up Now
                  </Link>
                  <Link to="/login" className="btn btn-outline">
                    Login
                  </Link>
                </>
              ) : (
                <button onClick={handleGetStarted} className="btn btn-primary">
                  Continue Learning
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;