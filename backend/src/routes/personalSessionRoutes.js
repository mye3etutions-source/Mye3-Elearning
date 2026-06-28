const express = require('express');
const router  = express.Router();
const {
  getPersonalStudents,
  getAllPersonalSessions,
  conflictCheck,
  assignSession,
  getPersonalPricing,
  updatePersonalPricing,
  getMyPersonalSessions,
  initiatePayment,
  getTeacherPersonalSessions,
  markSlotStarted,
  markSlotCompleted
} = require('../controllers/personalSessionController');

const { protect }          = require('../middleware/authMiddleware');
const { authorizeRoles }   = require('../middleware/roleMiddleware');

// ── ADMIN routes ──────────────────────────────────────────────────────────────
router.get('/admin/personal-sessions/students',          protect, authorizeRoles('admin'), getPersonalStudents);
router.get('/admin/personal-sessions/conflict-check',    protect, authorizeRoles('admin'), conflictCheck);
router.get('/admin/personal-sessions/pricing',           protect, authorizeRoles('admin'), getPersonalPricing);
router.put('/admin/personal-sessions/pricing',           protect, authorizeRoles('admin'), updatePersonalPricing);
router.get('/admin/personal-sessions',                   protect, authorizeRoles('admin'), getAllPersonalSessions);
router.put('/admin/personal-sessions/:studentId/assign', protect, authorizeRoles('admin'), assignSession);

// ── STUDENT routes ────────────────────────────────────────────────────────────
router.get('/student/personal-sessions/pricing',      protect, getPersonalPricing);
router.get('/student/personal-sessions',              protect, getMyPersonalSessions);
router.post('/student/personal-sessions/:id/pay',     protect, initiatePayment);

// ── TEACHER routes ────────────────────────────────────────────────────────────
router.get('/teacher/personal-sessions',                                   protect, authorizeRoles('teacher'), getTeacherPersonalSessions);
router.put('/teacher/personal-sessions/:sessionId/slots/:slotId/start',    protect, authorizeRoles('teacher'), markSlotStarted);
router.put('/teacher/personal-sessions/:sessionId/slots/:slotId/complete', protect, authorizeRoles('teacher'), markSlotCompleted);

module.exports = router;
