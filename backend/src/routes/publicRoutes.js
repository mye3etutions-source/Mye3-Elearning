const express = require('express');
const router = express.Router();
const { getPublicTeachers } = require('../controllers/publicController');

router.get('/teachers', getPublicTeachers);

module.exports = router;
