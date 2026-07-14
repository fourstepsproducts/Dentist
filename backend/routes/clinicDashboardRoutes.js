const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/clinicDashboardController');
const { protect } = require('../middleware/authMiddleware');

// All clinic dashboard routes require authentication
router.use(protect);

router.route('/stats').get(getDashboardStats);

module.exports = router;
