const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword } = require('../controllers/staffController');
const { protect } = require('../middleware/authMiddleware');

// All staff routes require authentication
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

module.exports = router;
