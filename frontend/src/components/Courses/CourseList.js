import React, { useState, useEffect, useCallback } from 'react';
import { courseAPI } from '../../services/api';
import CourseCard from './CourseCard';
import Loading from '../Common/Loading';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    search: '',
    page: 1,
  });
  const [pagination, setPagination] = useState(null);
  const [searchInput, setSearchInput] = useState(''); // Separate state for input

  const categories = [
    'Programming', 'Web Development', 'Data Science', 
    'Mobile Development', 'DevOps', 'Design', 
    'Business', 'Marketing', 'Other'
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  // Wrap fetchCourses in useCallback to prevent unnecessary re-renders
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getAllCourses(filters);
      setCourses(response.courses);
      setPagination(response.pagination);
      setError('');
    } catch (err) {
      setError('Failed to fetch courses');
      console.error('Fetch courses error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]); // Include filters as dependency since fetchCourses uses it

  // Debounced search function
  const debouncedSearch = useCallback((searchValue) => {
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        search: searchValue,
        page: 1
      }));
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, []);

  // Effect for fetching courses when filters change
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]); // Now includes fetchCourses as dependency

  // Effect for debounced search
  useEffect(() => {
    const cleanup = debouncedSearch(searchInput);
    return cleanup;
  }, [searchInput, debouncedSearch]);

  const handleFilterChange = (key, value) => {
    setFilters({
      ...filters,
      [key]: value,
      page: 1, // Reset to first page when filters change
    });
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value); // Update input immediately for responsive UI
    // The debounced search will handle the API call
  };

  const handlePageChange = (newPage) => {
    setFilters({
      ...filters,
      page: newPage,
    });
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      level: '',
      search: '',
      page: 1,
    });
    setSearchInput(''); // Also clear the search input
  };

  if (loading && courses.length === 0) return <Loading />;

  return (
    <div className="course-list-container">
      <div className="course-list-header">
        <h1>Available Courses</h1>
        <p>Discover and enroll in courses that match your interests</p>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchInput} // Use searchInput instead of filters.search
            onChange={handleSearchChange} // Use new handler
          />
          {loading && searchInput && (
            <div className="search-loading">Searching...</div>
          )}
        </div>

        <div className="filter-dropdowns">
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={filters.level}
            onChange={(e) => handleFilterChange('level', e.target.value)}
          >
            <option value="">All Levels</option>
            {levels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>

          <button onClick={clearFilters} className="clear-filters-btn">
            Clear Filters
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Course Grid */}
      {courses.length === 0 && !loading ? (
        <div className="no-courses">
          <p>No courses found matching your criteria.</p>
          {searchInput && (
            <p>Try different keywords or clear the search filter.</p>
          )}
        </div>
      ) : (
        <div className="courses-grid">
          {courses.map(course => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrev}
            className="pagination-btn"
          >
            Previous
          </button>
          
          <span className="pagination-info">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNext}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseList;