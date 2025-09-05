import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import CreateCourse from '../Courses/CreateCourse';
import Loading from '../Common/Loading';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchInstructorCourses();
  }, []);

  const fetchInstructorCourses = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getInstructorCourses();
      setCourses(response.courses);
      setError('');
    } catch (err) {
      setError('Failed to fetch your courses');
      console.error('Fetch instructor courses error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseCreated = () => {
    setShowCreateForm(false);
    fetchInstructorCourses(); // Refresh the course list
  };

  const handleDeleteCourse = async (courseId, courseTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await courseAPI.deleteCourse(courseId);
      // Refresh the course list
      fetchInstructorCourses();
    } catch (err) {
      setError('Failed to delete course');
      console.error('Delete course error:', err);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Instructor Dashboard</h1>
        <p>Welcome back, {user?.username}! Manage your courses and track student progress.</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="dashboard-actions">
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn btn-primary"
        >
          {showCreateForm ? 'Cancel' : 'Create New Course'}
        </button>
        <Link to="/courses" className="btn btn-secondary">
          View All Courses
        </Link>
      </div>

      {showCreateForm && (
        <div className="create-course-section">
          <CreateCourse 
            onCourseCreated={handleCourseCreated}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      <div className="dashboard-section">
        <h2>My Courses ({courses.length})</h2>
        
        {courses.length === 0 ? (
          <div className="empty-state">
            <p>You haven't created any courses yet.</p>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="btn btn-primary"
            >
              Create Your First Course
            </button>
          </div>
        ) : (
          <div className="instructor-courses">
            {courses.map((course) => (
              <div key={course._id} className="instructor-course-card">
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
                    <span className="course-duration">{course.duration}</span>
                    <span className="course-status">
                      {course.isPublished ? '✅ Published' : '❌ Draft'}
                    </span>
                  </div>
                  
                  <div className="course-stats">
                    <div className="stat">
                      <strong>{course.enrolledStudents?.length || 0}</strong>
                      <span>Students Enrolled</span>
                    </div>
                    {course.maxStudents && (
                      <div className="stat">
                        <strong>{course.maxStudents}</strong>
                        <span>Max Students</span>
                      </div>
                    )}
                    <div className="stat">
                      <strong>${course.price || 0}</strong>
                      <span>Price</span>
                    </div>
                  </div>

                  {course.enrolledStudents?.length > 0 && (
                    <div className="enrolled-students-preview">
                      <h4>Recent Enrollments:</h4>
                      <div className="students-preview">
                        {course.enrolledStudents.slice(0, 3).map((enrollment, index) => (
                          <div key={index} className="student-preview">
                            <span>{enrollment.student?.username}</span>
                            <small>
                              {new Date(enrollment.enrolledAt).toLocaleDateString()}
                            </small>
                          </div>
                        ))}
                        {course.enrolledStudents.length > 3 && (
                          <small>+{course.enrolledStudents.length - 3} more students</small>
                        )}
                      </div>
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
                  <Link 
                    to={`/instructor/courses/${course._id}/edit`} 
                    className="btn btn-secondary btn-small"
                  >
                    Edit
                  </Link>
                  <button 
                    onClick={() => handleDeleteCourse(course._id, course.title)}
                    className="btn btn-danger btn-small"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {courses.length > 0 && (
        <div className="dashboard-stats">
          <h2>Quick Stats</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{courses.length}</h3>
              <p>Total Courses</p>
            </div>
            <div className="stat-card">
              <h3>{courses.reduce((total, course) => total + (course.enrolledStudents?.length || 0), 0)}</h3>
              <p>Total Students</p>
            </div>
            <div className="stat-card">
              <h3>{courses.filter(course => course.isPublished).length}</h3>
              <p>Published Courses</p>
            </div>
            <div className="stat-card">
              <h3>${courses.reduce((total, course) => total + (course.price || 0), 0)}</h3>
              <p>Total Course Value</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;