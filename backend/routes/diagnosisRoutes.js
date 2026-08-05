const express = require('express');
const router = express.Router();
const {
  getDiagnosesByPatient,
  createDiagnosis,
  getDiagnosisById,
} = require('../controllers/diagnosisController');
const { protect } = require('../middleware/authMiddleware');

// All diagnosis endpoints require a valid auth token
router.use(protect);

// GET /api/diagnoses?patientId=xxx  →  all visits for a patient
// POST /api/diagnoses               →  create a new visit record
router.route('/')
  .get(getDiagnosesByPatient)
  .post(createDiagnosis);

// GET /api/diagnoses/:id  →  single visit record detail
router.route('/:id')
  .get(getDiagnosisById);

module.exports = router;
