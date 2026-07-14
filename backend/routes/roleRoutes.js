const express = require('express');
const router = express.Router();
const { getRoles, createRole } = require('../controllers/roleController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// All role routes require authentication
router.use(protect);

router.route('/')
  .get(getRoles)
  .post(authorizeRoles('admin'), createRole);

module.exports = router;
