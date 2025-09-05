import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loading from '../Common/Loading';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getEnrolledCourses();
      setEnrolledCourses(response.courses);
      setError('');
    } catch (err) {
      setError('Failed to fetch enrolled courses');
      console.error('Fetch enrolled courses error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async (courseId) => {
    if (!window.confirm('Are you sure you want to unenroll from this course?')) {
      return;
    }

    try {
      await courseAPI.unenrollFromCourse(courseId);
      // Refresh the enrolled courses list
      fetchEnrolledCourses();
    } catch (err) {
      setError('Failed to unenroll from course');
      console.error('Unenroll error:', err);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.username}!</h1>
        <p>Track your learning progress and discover new courses</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="dashboard-actions">
        <Link to="/courses" className="btn btn-primary">
          Browse All Courses
        </Link>
        <Link to="/recommendations" className="btn btn-secondary">
          Get Course Recommendations
        </Link>
      </div>

      <div className="dashboard-section">
        <h2>My Enrolled Courses ({enrolledCourses.length})</h2>
        
        {enrolledCourses.length === 0 ? (
          <div className="empty-state">
            <p>You haven't enrolled in any courses yet.</p>
            <Link to="/courses" className="btn btn-primary">
              Explore Courses
            </Link>
          </div>
        ) : (
          <div className="enrolled-courses">
            {enrolledCourses.map((course) => (
              <div key={course._id} className="enrolled-course-card">
                <div className="course-info">
                  <h3>{course.title}</h3>
                  <p className="course-description">
                    {course.description.length > 150 
                      ? course.description.substring(0, 150) + '...'
                      : course.description
                    }
                  </p>
                  <div className="course-meta">
                    <span className="course-category">{course.category}</span>
                    <span className="course-level">{course.level}</span>
                    <span className="course-instructor">
                      By: {course.instructor?.username}
                    </span>
                  </div>
                  
                  {course.enrollmentDetails && (
                    <div className="enrollment-info">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${course.enrollmentDetails.progress}%` }}
                        ></div>
                      </div>
                      <small>
                        Progress: {course.enrollmentDetails.progress}% | 
                        Enrolled: {new Date(course.enrollmentDetails.enrolledAt).toLocaleDateString()}
                      </small>
                    </div>
                  )}
                </div>
                
                <div className="course-actions">
                  <Link 
                    to={`/courses/${course._id}`} 
                    className="btn btn-primary btn-small"
                  >
                    View Course
                  </Link>
                  <button 
                    onClick={() => handleUnenroll(course._id)}
                    className="btn btn-danger btn-small"
                  >
                    Unenroll
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;