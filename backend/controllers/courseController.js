const Course = require('../models/Course');
const User = require('../models/User');

// Create a new course (Instructors only)
exports.createCourse = async (req, res) => {
  try {
    const { title, description, content, category, level, duration, price, maxStudents } = req.body;

    // Validation
    if (!title || !description || !content || !category || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, content, category, duration'
      });
    }

    // Create course with instructor ID from auth middleware
    const course = new Course({
      title,
      description,
      content,
      category,
      level,
      duration,
      price: price || 0,
      maxStudents,
      instructor: req.userId
    });

    await course.save();

    // Populate instructor details
    await course.populate('instructor', 'username email');

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating course'
    });
  }
};

// Get all courses (Public - with filters)
exports.getAllCourses = async (req, res) => {
  try {
    const { category, level, search, page = 1, limit = 10 } = req.query;

    // Build filter object
    const filter = { isPublished: true };
    
    if (category) filter.category = category;
    if (level) filter.level = level;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get courses with pagination
    const courses = await Course.find(filter)
      .populate('instructor', 'username email')
      .select('-content') // Don't send full content in list view
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Course.countDocuments(filter);

    res.json({
      success: true,
      courses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCourses: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching courses'
    });
  }
};

// Get single course by ID
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'username email')
      .populate('enrolledStudents.student', 'username email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      course
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching course'
    });
  }
};

// Update course (Instructor only - own courses)
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the instructor of this course
    if (course.instructor.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own courses'
      });
    }

    // Update course
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('instructor', 'username email');

    res.json({
      success: true,
      message: 'Course updated successfully',
      course: updatedCourse
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating course'
    });
  }
};

// Delete course (Instructor only - own courses)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the instructor of this course
    if (course.instructor.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own courses'
      });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting course'
    });
  }
};

// Get instructor's courses
exports.getInstructorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.userId })
      .populate('enrolledStudents.student', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      courses
    });
  } catch (error) {
    console.error('Get instructor courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching courses'
    });
  }
};

// Enroll in course (Students only)
exports.enrollInCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if course is published
    if (!course.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'Course is not available for enrollment'
      });
    }

    // Check if course is full
    if (course.isFull()) {
      return res.status(400).json({
        success: false,
        message: 'Course is full. Cannot enroll more students'
      });
    }

    // Check if already enrolled
    if (course.isStudentEnrolled(req.userId)) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course'
      });
    }

    // Check if user is the instructor
    if (course.instructor.toString() === req.userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Instructors cannot enroll in their own courses'
      });
    }

    // Enroll student
    course.enrolledStudents.push({
      student: req.userId,
      enrolledAt: new Date(),
      progress: 0
    });

    await course.save();

    res.json({
      success: true,
      message: 'Successfully enrolled in course',
      enrollment: {
        courseId: course._id,
        courseTitle: course.title,
        enrolledAt: new Date()
      }
    });
  } catch (error) {
    console.error('Enroll course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while enrolling in course'
    });
  }
};

// Get student's enrolled courses
exports.getEnrolledCourses = async (req, res) => {
  try {
    const courses = await Course.find({
      'enrolledStudents.student': req.userId
    })
    .populate('instructor', 'username email')
    .sort({ 'enrolledStudents.enrolledAt': -1 });

    // Add enrollment details to each course
    const enrolledCourses = courses.map(course => {
      const enrollment = course.enrolledStudents.find(
        e => e.student.toString() === req.userId.toString()
      );
      
      return {
        ...course.toObject(),
        enrollmentDetails: {
          enrolledAt: enrollment.enrolledAt,
          progress: enrollment.progress
        }
      };
    });

    res.json({
      success: true,
      courses: enrolledCourses
    });
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching enrolled courses'
    });
  }
};

// Unenroll from course (Students only)
exports.unenrollFromCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if student is enrolled
    if (!course.isStudentEnrolled(req.userId)) {
      return res.status(400).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    // Remove student from enrolled list
    course.enrolledStudents = course.enrolledStudents.filter(
      enrollment => enrollment.student.toString() !== req.userId.toString()
    );

    await course.save();

    res.json({
      success: true,
      message: 'Successfully unenrolled from course'
    });
  } catch (error) {
    console.error('Unenroll course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while unenrolling from course'
    });
  }
};