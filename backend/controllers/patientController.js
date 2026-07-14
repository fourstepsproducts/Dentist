const Patient = require('../models/Patient');

// @desc    Get all patients with search filter
// @route   GET /api/patients
// @access  Private
const getPatients = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

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

// @desc    Get patient by ID
// @route   GET /api/patients/:id
// @access  Private
const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(patient);
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

    // Auto-generate safe unique patient ID
    const lastPatient = await Patient.findOne().sort({ createdAt: -1 });
    let nextNumber = 1;
    if (lastPatient && lastPatient.patientId) {
      const match = lastPatient.patientId.match(/PAT-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }
    const patientId = `PAT-${String(nextNumber).padStart(4, '0')}`;

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
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    await Patient.deleteOne({ _id: req.params.id });
    res.json({ message: 'Patient removed successfully' });
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
