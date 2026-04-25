const express = require('express');
const router = express.Router();
const { getSubjects, createSubject, updateSubject, deleteSubject } = require('../controllers/subjectController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Simplified routes for Class 11-12 Subject Management
router.get('/', getSubjects); // Public or protect as needed
router.post('/', protect, authorizeRoles('admin'), createSubject);
router.put('/:id', protect, authorizeRoles('admin'), updateSubject);
router.delete('/:id', protect, authorizeRoles('admin'), deleteSubject);

module.exports = router;
