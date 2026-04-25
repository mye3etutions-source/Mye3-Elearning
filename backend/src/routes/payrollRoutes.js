const express = require('express');
const router = express.Router();
const { calculatePayouts, getPayouts, markPaid } = require('../controllers/payrollController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.post('/calculate', protect, authorizeRoles('admin'), calculatePayouts);
router.get('/', protect, authorizeRoles('admin'), getPayouts);
router.put('/:id/pay', protect, authorizeRoles('admin'), markPaid);

module.exports = router;
