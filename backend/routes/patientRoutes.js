const express = require('express');
const router = express.Router();
const {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  addPatientRecordItem,
} = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');

// All patient endpoints are protected by token authentication
router.use(protect);

router.route('/')
  .get(getPatients)
  .post(createPatient);

router.route('/:id')
  .get(getPatientById)
  .put(updatePatient)
  .delete(deletePatient);

router.route('/:id/records')
  .post(addPatientRecordItem);

module.exports = router;
