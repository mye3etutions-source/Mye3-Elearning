const Subject = require('../models/Subject');

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Public (or Admin protected)
exports.getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find({}).sort({ classLevel: 1 });
    res.status(200).json(subjects);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new subject
// @route   POST /api/subjects
// @access  Admin
exports.createSubject = async (req, res, next) => {
  try {
    const { name, classLevel, price, teacherName } = req.body;
    const subject = await Subject.create({
      name,
      classLevel,
      price,
      teacherName: teacherName || 'Not Assigned'
    });
    res.status(201).json(subject);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a subject
// @route   PUT /api/subjects/:id
// @access  Admin
exports.updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.status(200).json(subject);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id
// @access  Admin
exports.deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.status(200).json({ message: 'Subject removed' });
  } catch (error) {
    next(error);
  }
};
