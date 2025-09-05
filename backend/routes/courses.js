const express = require('express');
const {
  createCourse,
  getAllCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  getInstructorCourses,
  enrollInCourse,
  getEnrolledCourses,
  unenrollFromCourse
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAllCourses); // Get all courses (with filters)
router.get('/:id', getCourse); // Get single course

// Protected routes - All users
router.use(protect); // All routes below require authentication

// Student routes
router.post('/:id/enroll', authorize('student'), enrollInCourse);
router.delete('/:id/enroll', authorize('student'), unenrollFromCourse);
router.get('/enrolled/my-courses', authorize('student'), getEnrolledCourses);

// Instructor routes
router.post('/', authorize('instructor'), createCourse);
router.get('/instructor/my-courses', authorize('instructor'), getInstructorCourses);
router.put('/:id', authorize('instructor'), updateCourse);
router.delete('/:id', authorize('instructor'), deleteCourse);

module.exports = router;