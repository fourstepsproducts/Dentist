const Diagnosis = require('../models/Diagnosis');
const Patient = require('../models/Patient');
const { generateVisitNumber } = require('../utils/generateId');

// @desc    Get all visit records for a specific patient
// @route   GET /api/diagnoses?patientId=xxx
// @access  Private
const getDiagnosesByPatient = async (req, res) => {
  try {
    const { patientId } = req.query;
    if (!patientId) {
      return res.status(400).json({ message: 'patientId query parameter is required' });
    }

    const patient = await Patient.findOne({ _id: patientId, isDeleted: { $ne: true } })
      .select('patientId name phone gender dateOfBirth');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Newest visit first
    const diagnoses = await Diagnosis.find({ patient: patientId })
      .sort({ visitNumber: -1 })
      .populate('createdBy', 'name');

    res.json({ patient, diagnoses });
  } catch (error) {
    console.error('Error fetching diagnoses:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new visit record for a patient
// @route   POST /api/diagnoses
// @access  Private
const createDiagnosis = async (req, res) => {
  try {
    const {
      patientId,
      visitType,        // 'normal' | 'specialist'
      visitDate,
      consultingDoctor, // only for 'specialist' type
      attendingDoctor,
      chiefComplaint,
      diagnosis,
      treatmentPerformed,
      notes,
      incentives,
    } = req.body;

    // Core required fields (both types)
    if (!patientId || !chiefComplaint || !diagnosis || !treatmentPerformed) {
      return res.status(400).json({
        message: 'Patient, Chief Complaint, Diagnosis, and Treatment Performed are required',
      });
    }

    const patient = await Patient.findOne({ _id: patientId, isDeleted: { $ne: true } });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found or has been deleted' });
    }

    // Atomic per-patient visit counter — never reused even if visits are deleted
    const visitNumber = await generateVisitNumber(patientId);

    const type = visitType === 'specialist' ? 'specialist' : 'normal';

    const newDiagnosis = await Diagnosis.create({
      patient:          patientId,
      visitNumber,
      visitType:        type,
      visitDate:        visitDate ? new Date(visitDate) : new Date(),
      // Consulting doctor only stored for specialist visits
      consultingDoctor: type === 'specialist' ? (consultingDoctor || '') : '',
      attendingDoctor:  attendingDoctor  || '',
      chiefComplaint,
      diagnosis,
      treatmentPerformed,
      notes:            notes      || '',
      incentives:       incentives || '',
      createdBy:        req.user ? req.user._id : null,
    });

    const populated = await Diagnosis.findById(newDiagnosis._id)
      .populate('patient', 'patientId name phone')
      .populate('createdBy', 'name');

    res.status(201).json(populated);
  } catch (error) {
    console.error('Error creating diagnosis:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get a single visit record by ID
// @route   GET /api/diagnoses/:id
// @access  Private
const getDiagnosisById = async (req, res) => {
  try {
    const diagnosis = await Diagnosis.findById(req.params.id)
      .populate('patient', 'patientId name phone gender')
      .populate('createdBy', 'name');

    if (!diagnosis) {
      return res.status(404).json({ message: 'Visit record not found' });
    }

    res.json(diagnosis);
  } catch (error) {
    console.error('Error fetching diagnosis by ID:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getDiagnosesByPatient,
  createDiagnosis,
  getDiagnosisById,
};
