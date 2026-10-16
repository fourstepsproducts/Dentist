const express = require('express');
const router = express.Router();
const {
  getQueue,
  checkInPatient,
  callNextPatient,
  callSpecificPatient,
  completeConsultation,
  cancelQueueEntry,
  toggleEmergency,
  getPatientCheckInCandidates,
} = require('../controllers/queueController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getQueue);
router.post('/checkin', checkInPatient);
router.post('/call-next', callNextPatient);
router.put('/:id/call-in', callSpecificPatient);
router.put('/:id/complete', completeConsultation);
router.put('/:id/cancel', cancelQueueEntry);
router.put('/:id/emergency', toggleEmergency);
router.get('/patient-appointments/:patientId', getPatientCheckInCandidates);

module.exports = router;
