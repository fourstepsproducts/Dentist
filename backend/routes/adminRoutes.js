const express = require('express');
const router = express.Router();
const {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDashboardCounts
} = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// All routes here are protected and require 'admin' role
router.use(protect);
router.use(authorizeRoles('admin'));

// Staff Routes
router.route('/staff')
  .get(getStaff)
  .post(createStaff);

router.route('/staff/:id')
  .put(updateStaff)
  .delete(deleteStaff);

// Doctor Routes
router.route('/doctors')
  .get(getDoctors)
  .post(createDoctor);

router.route('/doctors/:id')
  .put(updateDoctor)
  .delete(deleteDoctor);

// Dashboard Routes
router.get('/dashboard/counts', getDashboardCounts);

module.exports = router;
