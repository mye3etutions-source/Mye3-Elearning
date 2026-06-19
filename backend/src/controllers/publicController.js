const User = require('../models/User');

// @desc    Get all teachers (public)
// @route   GET /api/public/teachers
// @access  Public
exports.getPublicTeachers = async (req, res, next) => {
  try {
    const teachers = await User.find({
      role: { $in: ['Teacher', 'teacher'] }
    }).select('name email assignedSubjects className board').limit(3);

    res.status(200).json(teachers);
  } catch (error) {
    next(error);
  }
};
