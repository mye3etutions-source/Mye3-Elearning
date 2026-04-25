const express = require('express');
const router = express.Router();
const {
  submitInquiry,
  getInquiries,
  updateInquiryStatus,
  deleteInquiry
} = require('../controllers/inquiryController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Public route to submit an inquiry
router.post('/', submitInquiry);

// Protected Admin routes
router.get('/', protect, authorizeRoles('admin'), getInquiries);
router.put('/:id/status', protect, authorizeRoles('admin'), updateInquiryStatus);
router.delete('/:id', protect, authorizeRoles('admin'), deleteInquiry);

module.exports = router;
