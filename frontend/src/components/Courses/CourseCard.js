import React from 'react';
import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Get enrollment count safely
  const getEnrollmentCount = () => {
    return course.enrolledStudents?.length || 0;
  };

  return (
    <div className="course-card">
      <div className="course-card-content">
        <h3 className="course-title">{course.title}</h3>
        <p className="course-description">
          {truncateText(course.description)}
        </p>
        
        <div className="course-meta">
          <span className="course-category">{course.category}</span>
          <span className="course-level">{course.level}</span>
          <span className="course-duration">{course.duration}</span>
        </div>
        
        {course.instructor && (
          <div className="course-instructor">
            <small>By: {course.instructor.username}</small>
          </div>
        )}
        
        <div className="course-enrollment-info">
          <small>{getEnrollmentCount()} students enrolled</small>
          {course.price > 0 && (
            <span className="course-price">${course.price}</span>
          )}
        </div>
        
        <div className="course-actions">
          <Link to={`/courses/${course._id}`} className="btn btn-primary">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;