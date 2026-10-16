const express = require('express');
const router = express.Router();
const { getActiveDoctors } = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');

// Protected routes for authenticated users
router.use(protect);

router.get('/', getActiveDoctors);

module.exports = router;
