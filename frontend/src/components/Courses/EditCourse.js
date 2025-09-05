import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseAPI } from '../../services/api';
import Loading from '../Common/Loading';

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: 'Programming',
    level: 'Beginner',
    duration: '',
    price: 0,
    maxStudents: '',
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Programming', 'Web Development', 'Data Science', 
    'Mobile Development', 'DevOps', 'Design', 
    'Business', 'Marketing', 'Other'
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  // Wrap fetchCourseData in useCallback with id as dependency
  const fetchCourseData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getCourse(id);
      const course = response.course;
      
      // Populate form with existing data
      setFormData({
        title: course.title || '',
        description: course.description || '',
        content: course.content || '',
        category: course.category || 'Programming',
        level: course.level || 'Beginner',
        duration: course.duration || '',
        price: course.price || 0,
        maxStudents: course.maxStudents || '',
      });
      setError('');
    } catch (err) {
      setError('Failed to load course data');
      console.error('Fetch course error:', err);
    } finally {
      setLoading(false);
    }
  }, [id]); // Include id as dependency since fetchCourseData uses it

  // Fetch course data on component mount or when id changes
  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]); // Now includes fetchCourseData as dependency

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUpdating(true);

    // Enhanced Validation
    if (formData.title.trim().length < 3) {
      setError('Course title must be at least 3 characters long');
      setUpdating(false);
      return;
    }

    if (formData.description.trim().length < 10) {
      setError('Course description must be at least 10 characters long');
      setUpdating(false);
      return;
    }

    if (!formData.content.trim() || !formData.duration.trim()) {
      setError('Please fill in all required fields');
      setUpdating(false);
      return;
    }

    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        maxStudents: formData.maxStudents === '' ? null : formData.maxStudents,
      };

      await courseAPI.updateCourse(id, submitData);
      
      // Navigate back to instructor dashboard
      navigate('/instructor/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to update course');
      console.error('Update course error:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    navigate('/instructor/dashboard');
  };

  if (loading) return <Loading message="Loading course data..." />;

  return (
    <div className="edit-course-container">
      <div className="edit-course-form">
        <h2>Edit Course</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Course Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                disabled={updating}
                placeholder="Enter course title"
              />
            </div>

            <div className="form-group">
              <label htmlFor="duration">Duration *</label>
              <input
                type="text"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
                disabled={updating}
                placeholder="e.g., 4 weeks, 2 months"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Course Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              disabled={updating}
              placeholder="Describe what students will learn in this course"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Course Content *</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              disabled={updating}
              placeholder="Detailed course content, syllabus, lessons, etc."
              rows="6"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={updating}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="level">Difficulty Level *</label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                disabled={updating}
              >
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price ($)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                disabled={updating}
                placeholder="0 for free course"
              />
            </div>

            <div className="form-group">
              <label htmlFor="maxStudents">Max Students</label>
              <input
                type="number"
                id="maxStudents"
                name="maxStudents"
                value={formData.maxStudents}
                onChange={handleChange}
                min="1"
                disabled={updating}
                placeholder="Leave empty for unlimited"
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={updating}
            >
              {updating ? 'Updating Course...' : 'Update Course'}
            </button>
            <button 
              type="button" 
              onClick={handleCancel}
              className="btn btn-secondary"
              disabled={updating}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCourse;