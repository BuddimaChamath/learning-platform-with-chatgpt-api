const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Programming',
      'Web Development',
      'Data Science',
      'Mobile Development',
      'DevOps',
      'Design',
      'Business',
      'Marketing',
      'Other'
    ]
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  duration: {
    type: String,
    required: true // e.g., "4 weeks", "2 months"
  },
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  enrolledStudents: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }],
  isPublished: {
    type: Boolean,
    default: true
  },
  maxStudents: {
    type: Number,
    default: null // null means unlimited
  }
}, {
  timestamps: true
});

// Index for better performance
courseSchema.index({ instructor: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ level: 1 });

// Virtual for enrolled students count
courseSchema.virtual('enrollmentCount').get(function() {
  return this.enrolledStudents.length;
});

// Method to check if user is enrolled
courseSchema.methods.isStudentEnrolled = function(studentId) {
  return this.enrolledStudents.some(
    enrollment => enrollment.student.toString() === studentId.toString()
  );
};

// Method to check if course is full
courseSchema.methods.isFull = function() {
  return this.maxStudents && this.enrolledStudents.length >= this.maxStudents;
};

module.exports = mongoose.model('Course', courseSchema);