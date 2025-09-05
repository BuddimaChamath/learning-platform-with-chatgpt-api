import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loading from '../Common/Loading';
import { Link } from 'react-router-dom';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Wrap fetchCourseDetails with useCallback to prevent unnecessary re-renders
  const fetchCourseDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getCourse(id);
      setCourse(response.course);
      setError('');
    } catch (err) {
      setError('Failed to fetch course details');
      console.error('Fetch course details error:', err);
    } finally {
      setLoading(false);
    }
  }, [id]); // Only recreate when id changes

  useEffect(() => {
    fetchCourseDetails();
  }, [fetchCourseDetails]); // Now include fetchCourseDetails in dependencies

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'student') {
      setError('Only students can enroll in courses');
      return;
    }

    setEnrolling(true);
    setError('');
    setSuccess('');

    try {
      await courseAPI.enrollInCourse(id);
      setSuccess('Successfully enrolled in course!');
      // Refresh course details to update enrollment status
      fetchCourseDetails();
    } catch (err) {
      setError(err.message || 'Failed to enroll in course');
      console.error('Enrollment error:', err);
    } finally {
      setEnrolling(false);
    }
  };

  const isEnrolled = () => {
    if (!course || !user) return false;
    return course.enrolledStudents?.some(
      enrollment => enrollment.student._id === user.id || enrollment.student === user.id
    );
  };

  const isOwner = () => {
    if (!course || !user) return false;
    return course.instructor._id === user.id;
  };

  // Security check: Can user see enrolled students?
  const canViewStudentsList = () => {
    // Only course instructor can see the full students list
    return isOwner();
  };

  // Get enrollment count safely
  const getEnrollmentCount = () => {
    return course.enrolledStudents?.length || 0;
  };

  if (loading) return <Loading />;

  if (!course) {
    return (
      <div className="course-details-container">
        <div className="error-message">
          Course not found
        </div>
      </div>
    );
  }

  return (
    <div className="course-details-container">
      <div className="course-details-header">
        <div className="course-header-info">
          <h1>{course.title}</h1>
          <div className="course-meta-info">
            <span className="course-category">{course.category}</span>
            <span className="course-level">{course.level}</span>
            <span className="course-duration">{course.duration}</span>
            {course.price > 0 && (
              <span className="course-price">${course.price}</span>
            )}
          </div>
          <div className="course-instructor-info">
            <strong>Instructor: </strong>
            {course.instructor?.username}
            {/* Only show instructor email to enrolled students or course owner */}
            {(isEnrolled() || isOwner()) && course.instructor?.email && (
              <span> ({course.instructor.email})</span>
            )}
          </div>
        </div>

        <div className="course-enrollment-stats">
          <div className="enrollment-count">
            <strong>{getEnrollmentCount()}</strong>
            <span>Students Enrolled</span>
          </div>
          {course.maxStudents && (
            <div className="max-students">
              <strong>Max: {course.maxStudents}</strong>
              <span>Students</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message enrollment-success">
        <div className="success-icon">✅</div>
        <div className="success-content">
        <h3>Enrollment Successful!</h3>
          <p>{success}</p>
        <p>You can now access the full course content below.</p>
        </div>
      </div>
    )}

      <div className="course-details-content">
        <div className="course-main-content">
          <div className="course-description">
            <h2>Course Description</h2>
            <p>{course.description}</p>
          </div>

          {/* Show full content only to enrolled students and course owner */}
          {(isEnrolled() || isOwner()) ? (
            <div className="course-content">
              <h2>Course Content</h2>
              <div className="content-text">
                {course.content.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          ) : (
            <div className="course-content-preview">
              <h2>Course Content</h2>
              <div className="content-preview">
                <p>
                  {course.content.length > 200 
                    ? course.content.substring(0, 200) + '...'
                    : course.content
                  }
                </p>
                <div className="content-locked">
                  <p><em>🔒 Enroll in this course to see the full content</em></p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="course-sidebar">
          <div className="enrollment-section">
            {!isAuthenticated ? (
              <div className="auth-prompt">
                <p>Please log in to enroll in this course</p>
                <button 
                  onClick={() => navigate('/login')}
                  className="btn btn-primary"
                >
                  Login to Enroll
                </button>
              </div>
            ) : isOwner() ? (
              <div className="owner-section">
                <p>You are the instructor of this course</p>
                <Link 
                  to={`/instructor/courses/${course._id}/edit`}
                  className="btn btn-primary"
                >
                  Edit Course
                </Link>
                <button 
                  onClick={() => navigate('/instructor/dashboard')}
                  className="btn btn-secondary"
                >
                  Manage Course
                </button>
              </div>
            ) : isEnrolled() ? (
              <div className="enrolled-section">
                <div className="enrollment-status">
                  ✅ You are enrolled in this course
                </div>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="btn btn-secondary"
                >
                  View My Courses
                </button>
              </div>
            ) : user?.role === 'student' ? (
              <div className="enroll-section">
                <button 
                  onClick={handleEnroll}
                  disabled={enrolling || (course.maxStudents && getEnrollmentCount() >= course.maxStudents)}
                  className="btn btn-primary btn-large"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>
                {course.maxStudents && getEnrollmentCount() >= course.maxStudents && (
                  <p className="course-full-notice">
                    This course is currently full
                  </p>
                )}
              </div>
            ) : (
              <div className="instructor-notice">
                <p>Instructors cannot enroll in courses</p>
              </div>
            )}
          </div>

          {/* SECURITY FIX: Only show enrolled students list to course instructor */}
          {canViewStudentsList() && getEnrollmentCount() > 0 && (
              <div className="enrolled-students">
                <h3>Enrolled Students ({getEnrollmentCount()})</h3>
                <table className="students-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Email</th>
                      <th>Enrolled Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {course.enrolledStudents.map((enrollment, index) => (
                      <tr key={index}>
                        <td>{enrollment.student?.username || 'Anonymous'}</td>
                        <td>{enrollment.student?.email || 'N/A'}</td>
                        <td>{new Date(enrollment.enrolledAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          {/* Show enrollment count to enrolled students (but not the list) */}
          {isEnrolled() && !isOwner() && getEnrollmentCount() > 1 && (
            <div className="enrollment-info">
              <h3>Course Community</h3>
              <p>You're learning with {getEnrollmentCount() - 1} other student{getEnrollmentCount() > 2 ? 's' : ''}!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;