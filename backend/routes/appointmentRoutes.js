const express = require('express');
const router = express.Router();
const { getAppointments, createAppointment, updateAppointmentStatus } = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

// Protect all appointment routes
router.use(protect);

router.route('/')
  .get(getAppointments)
  .post(createAppointment);

router.put('/:id/status', updateAppointmentStatus);

module.exports = router;
