import React, { useState } from 'react';
import { courseAPI } from '../../services/api';

const CreateCourse = ({ onCourseCreated, onCancel }) => {
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Programming', 'Web Development', 'Data Science', 
    'Mobile Development', 'DevOps', 'Design', 
    'Business', 'Marketing', 'Other'
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced'];

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
    setLoading(true);

    // Validation
    if (formData.title.trim().length < 3) {
    setError('Course title must be at least 3 characters long');
    setLoading(false);
    return;
    }

    if (formData.description.trim().length < 10) {
      setError('Course description must be at least 10 characters long');
      setLoading(false);
      return;
    }

    if (!formData.content.trim() || !formData.duration.trim()) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        maxStudents: formData.maxStudents === '' ? null : formData.maxStudents,
      };

      await courseAPI.createCourse(submitData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        content: '',
        category: 'Programming',
        level: 'Beginner',
        duration: '',
        price: 0,
        maxStudents: '',
      });
      
      // Call the success callback
      onCourseCreated();
    } catch (err) {
      setError(err.message || 'Failed to create course');
      console.error('Create course error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-course-container">
      <div className="create-course-form">
        <h2>Create New Course</h2>
        
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
                disabled={loading}
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
                disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
                placeholder="Leave empty for unlimited"
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating Course...' : 'Create Course'}
            </button>
            <button 
              type="button" 
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;