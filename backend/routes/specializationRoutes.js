const express = require('express');
const router = express.Router();
const { getSpecializations, createSpecialization } = require('../controllers/specializationController');
const { protect } = require('../middleware/authMiddleware');

// All specialization routes require authentication
router.use(protect);

router.route('/')
  .get(getSpecializations)
  .post(createSpecialization);

module.exports = router;
