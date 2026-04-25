const express = require('express');
const router = express.Router();
const {
  getMyClasses,
  getMyAssignments,
  getLiveSessions,
  updateSessionStatus,
  uploadRecording,
  getRecordings,
  getMaterials,
  uploadMaterial,
  deleteMaterial,
  getDashboardStats,
  toggleMaterialVisibility,
  getEarnings
} = require('../controllers/teacherController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// All teacher routes are protected
router.use(protect);
router.use(authorizeRoles('teacher'));

router.get('/my-classes', getMyClasses);
router.get('/my-assignments', getMyAssignments);
router.get('/live-sessions', getLiveSessions);
router.put('/live-sessions/:id/status', updateSessionStatus);
router.post('/recordings', uploadRecording);
router.get('/recordings', getRecordings);
router.get('/materials', getMaterials);
router.post('/materials', upload.single('file'), uploadMaterial);
router.delete('/materials/:id', deleteMaterial);
router.patch('/materials/:id/visibility', toggleMaterialVisibility);
router.get('/dashboard-stats', getDashboardStats);
router.get('/earnings', getEarnings);

module.exports = router;
