const Inquiry = require('../models/Inquiry');

// @desc    Submit a new inquiry
// @route   POST /api/inquiries
// @access  Public
const submitInquiry = async (req, res, next) => {
  try {
    const { name, mobile, email, role, subject, message, source } = req.body;

    if (!name || !mobile) {
      return res.status(400).json({ message: 'Name and mobile number are required.' });
    }

    const inquiry = new Inquiry({
      name,
      mobile,
      email,
      role,
      subject,
      message,
      source: source || 'Contact Page'
    });

    await inquiry.save();

    res.status(201).json({ message: 'Inquiry submitted successfully', inquiry });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all inquiries
// @route   GET /api/inquiries
// @access  Private/Admin
const getInquiries = async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error) {
    next(error);
  }
};

// @desc    Update inquiry status
// @route   PUT /api/inquiries/:id/status
// @access  Private/Admin
const updateInquiryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const inquiry = await Inquiry.findById(req.params.id);

    if (inquiry) {
      inquiry.status = status || inquiry.status;
      const updatedInquiry = await inquiry.save();
      res.json(updatedInquiry);
    } else {
      res.status(404).json({ message: 'Inquiry not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete inquiry
// @route   DELETE /api/inquiries/:id
// @access  Private/Admin
const deleteInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (inquiry) {
      await inquiry.deleteOne();
      res.json({ message: 'Inquiry removed' });
    } else {
      res.status(404).json({ message: 'Inquiry not found' });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitInquiry,
  getInquiries,
  updateInquiryStatus,
  deleteInquiry
};
