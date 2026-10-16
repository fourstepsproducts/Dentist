const Patient = require('../models/Patient');
const Diagnosis = require('../models/Diagnosis');
const Appointment = require('../models/Appointment');
const { generatePatientId } = require('../utils/generateId');

// @desc    Get all patients with search filter
// @route   GET /api/patients
// @access  Private
const getPatients = async (req, res) => {
  try {
    const { search } = req.query;

    // Always exclude soft-deleted records from normal listings
    let query = { isDeleted: { $ne: true } };

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { patientId: searchRegex },
        { name: searchRegex },
        { phone: searchRegex },
      ];
    }

    const patients = await Patient.find(query).sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get patient by ID with aggregated clinical history records
// @route   GET /api/patients/:id
// @access  Private
const getPatientById = async (req, res) => {
  try {
    const patientDoc = await Patient.findOne({ _id: req.params.id, isDeleted: { $ne: true } }).lean();
    if (!patientDoc) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Fetch clinical visits logged for this patient in Diagnosis collection
    const diagnosisRecords = await Diagnosis.find({ patient: req.params.id }).sort({ visitDate: -1, createdAt: -1 }).lean();

    const chiefComplaintsMap = new Map();
    (patientDoc.chiefComplaints || []).forEach(c => {
      if (c.text) {
        chiefComplaintsMap.set(c.text.trim() + '_' + (c.date || c.createdAt || ''), {
          _id: c._id,
          text: c.text,
          date: c.date || c.createdAt,
          hasAppointment: Boolean(c.hasAppointment || c.appointmentId),
          appointmentId: c.appointmentId || null,
          recordedBy: c.recordedBy || '',
        });
      }
    });
    diagnosisRecords.forEach(d => {
      if (d.chiefComplaint) {
        const key = d.chiefComplaint.trim() + '_' + (d.visitDate || d.createdAt || '');
        if (!chiefComplaintsMap.has(key)) {
          chiefComplaintsMap.set(key, {
            _id: d._id,
            text: d.chiefComplaint,
            date: d.visitDate || d.createdAt,
            hasAppointment: false,
            recordedBy: d.attendingDoctor || d.createdBy?.name || '',
          });
        }
      }
    });

    const appointmentRecords = await Appointment.find({ patient: req.params.id }).sort({ date: -1, createdAt: -1 }).lean();
    appointmentRecords.forEach(a => {
      if (a.chiefComplaint) {
        const key = a.chiefComplaint.trim() + '_' + (a.date || a.createdAt || '');
        if (!chiefComplaintsMap.has(key)) {
          chiefComplaintsMap.set(key, {
            _id: a._id,
            text: a.chiefComplaint,
            date: a.date || a.createdAt,
            hasAppointment: true,
            appointmentId: a._id,
            recordedBy: a.doctorName || '',
          });
        }
      }
    });

    const diagnosesMap = new Map();
    (patientDoc.diagnoses || []).forEach(d => {
      if (d.diagnosis) diagnosesMap.set(d.diagnosis.trim(), { diagnosis: d.diagnosis, treatmentPlan: d.treatmentPlan || d.treatmentPerformed || '', date: d.date || d.createdAt });
    });
    diagnosisRecords.forEach(d => {
      if (d.diagnosis && !diagnosesMap.has(d.diagnosis.trim())) {
        diagnosesMap.set(d.diagnosis.trim(), { diagnosis: d.diagnosis, treatmentPlan: d.treatmentPerformed || '', date: d.visitDate || d.createdAt });
      }
    });

    const treatmentsMap = new Map();
    (patientDoc.treatments || []).forEach(t => {
      if (t.name) treatmentsMap.set(t.name.trim(), { name: t.name, cost: t.cost || 0, status: t.status || 'Completed', date: t.date || t.createdAt });
    });
    diagnosisRecords.forEach(d => {
      if (d.treatmentPerformed && !treatmentsMap.has(d.treatmentPerformed.trim())) {
        treatmentsMap.set(d.treatmentPerformed.trim(), { name: d.treatmentPerformed, cost: 0, status: 'Completed', date: d.visitDate || d.createdAt });
      }
    });

    res.json({
      ...patientDoc,
      chiefComplaints: Array.from(chiefComplaintsMap.values()),
      diagnoses: Array.from(diagnosesMap.values()),
      treatments: Array.from(treatmentsMap.values()),
      documents: patientDoc.documents || [],
      diagnosisRecords,
    });
  } catch (error) {
    console.error('Error fetching patient details:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Register a new patient
// @route   POST /api/patients
// @access  Private
const createPatient = async (req, res) => {
  try {
    const { name, phone, email, gender, dateOfBirth, address, emergencyContact } = req.body;

    if (!name || !phone || !gender || !dateOfBirth || !address) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // ── Atomic Counter ID Generation ───────────────────────────────
    // generatePatientId() atomically increments a dedicated 'patient'
    // counter in the Counters collection using MongoDB's $inc operator.
    // This is a single atomic DB operation — no race conditions possible.
    // Deleting any patient record never affects this counter.
    const patientId = await generatePatientId();

    const newPatient = await Patient.create({
      patientId,
      name,
      phone,
      email,
      gender,
      dateOfBirth,
      address,
      emergencyContact,
    });

    res.status(201).json(newPatient);
  } catch (error) {
    console.error('Error registering patient:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update patient details
// @route   PUT /api/patients/:id
// @access  Private
const updatePatient = async (req, res) => {
  try {
    const { name, phone, email, gender, dateOfBirth, address, emergencyContact } = req.body;

    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    patient.name = name || patient.name;
    patient.phone = phone || patient.phone;
    patient.email = email !== undefined ? email : patient.email;
    patient.gender = gender || patient.gender;
    patient.dateOfBirth = dateOfBirth || patient.dateOfBirth;
    patient.address = address || patient.address;
    if (emergencyContact) {
      patient.emergencyContact = {
        name: emergencyContact.name !== undefined ? emergencyContact.name : patient.emergencyContact?.name,
        relationship: emergencyContact.relationship !== undefined ? emergencyContact.relationship : patient.emergencyContact?.relationship,
        phone: emergencyContact.phone !== undefined ? emergencyContact.phone : patient.emergencyContact?.phone,
      };
    }

    const updatedPatient = await patient.save();
    res.json(updatedPatient);
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private
const deletePatient = async (req, res) => {
  try {
    // ── Soft Delete — Record is NEVER permanently removed ──────────
    // isDeleted = true hides the patient from all normal listings.
    // The record (and its patientId) remains in the database forever so:
    //   - Old invoices, appointments, and audit logs still point to a valid record
    //   - The patientId is NEVER reused for a new patient
    //   - The record can be restored by an administrator if needed
    const patient = await Patient.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    patient.isDeleted = true;
    patient.deletedAt = new Date();
    // If auth middleware attaches req.user, record who deleted it
    patient.deletedBy = req.user ? req.user._id : null;
    await patient.save();

    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add clinic history item (complaint, diagnosis, treatment, document)
// @route   POST /api/patients/:id/records
// @access  Private
const addPatientRecordItem = async (req, res) => {
  try {
    const { type, payload } = req.body;
    if (!type || !payload) {
      return res.status(400).json({ message: 'Missing type or payload' });
    }

    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    if (type === 'chiefComplaints') {
      patient.chiefComplaints.push(payload);
    } else if (type === 'diagnoses') {
      patient.diagnoses.push(payload);
    } else if (type === 'treatments') {
      patient.treatments.push(payload);
    } else if (type === 'documents') {
      patient.documents.push(payload);
    } else {
      return res.status(400).json({ message: 'Invalid record type' });
    }

    const updatedPatient = await patient.save();
    res.json(updatedPatient);
  } catch (error) {
    console.error('Error adding patient record item:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  addPatientRecordItem,
};
