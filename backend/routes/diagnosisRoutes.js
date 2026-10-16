const express = require('express');
const router = express.Router();
const {
  getDiagnosesByPatient,
  createDiagnosis,
  logChiefComplaint,
  logTreatmentRecord,
  getDiagnosisById,
  deleteDiagnosis,
} = require('../controllers/diagnosisController');
const { protect } = require('../middleware/authMiddleware');

// All diagnosis endpoints require a valid auth token
router.use(protect);

// POST /api/diagnoses/complaint  →  log/update chief complaint for a specific visit
router.post('/complaint', logChiefComplaint);

// POST /api/diagnoses/treatment  →  log/update diagnosis and treatment record for a specific visit
router.post('/treatment', logTreatmentRecord);

// GET /api/diagnoses?patientId=xxx  →  all visits for a patient
// POST /api/diagnoses               →  create a new visit record
router.route('/')
  .get(getDiagnosesByPatient)
  .post(createDiagnosis);

// GET /api/diagnoses/:id     →  single visit record detail
// DELETE /api/diagnoses/:id  →  delete visit record
router.route('/:id')
  .get(getDiagnosisById)
  .delete(deleteDiagnosis);

module.exports = router;
