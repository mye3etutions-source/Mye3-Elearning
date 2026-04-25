const express = require('express');
const router = express.Router();
const { 
  getMySubscriptions, 
  getLiveAlerts, 
  getCourseContent,
  getMyLearning,
  getMaterialsByAssignment,
  processMockPayment,
  getCatalog,
  getMyTransactions,
  getAllMaterials
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Public student routes
router.get('/catalog', getCatalog);

// All other student routes are protected
router.use(protect);
router.use(authorizeRoles('student', 'admin'));

router.get('/subscriptions', getMySubscriptions);
router.get('/my-learning', getMyLearning);
router.get('/live-alerts', getLiveAlerts);
router.get('/content/:courseName', getCourseContent);
router.get('/materials/:assignmentId', getMaterialsByAssignment);
router.post('/mock-payment-success', processMockPayment);
router.get('/transactions', getMyTransactions);
router.get('/all-materials', getAllMaterials);

module.exports = router;
