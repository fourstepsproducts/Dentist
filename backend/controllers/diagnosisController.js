const Diagnosis = require('../models/Diagnosis');
const Patient = require('../models/Patient');
const User = require('../models/User');
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
      .populate('createdBy', 'name')
      .populate('attendingDoctorId', 'name employeeId specialization')
      .populate('consultingDoctorId', 'name employeeId specialization');

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
      appointmentId,
      visitType,        // 'normal' | 'specialist'
      visitDate,
      consultingDoctor,   // text name or override
      consultingDoctorId, // ObjectId for consulting doctor
      attendingDoctor,    // text name or override
      attendingDoctorId,  // ObjectId for attending doctor
      chiefComplaint,
      diagnosis,
      treatmentPerformed,
      notes,
      incentives,
      consultingDoctorIncentive,
      attendingDoctorIncentive,
    } = req.body;

    // Core required fields (patientId only for visit creation)
    if (!patientId) {
      return res.status(400).json({
        message: 'Patient is required',
      });
    }

    const patient = await Patient.findOne({ _id: patientId, isDeleted: { $ne: true } });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found or has been deleted' });
    }

    let finalChiefComplaint = chiefComplaint ? chiefComplaint.trim() : '';

    // If an appointmentId is provided, check if appointment has a chiefComplaint
    let linkedAppointment = null;
    if (appointmentId) {
      const Appointment = require('../models/Appointment');
      linkedAppointment = await Appointment.findById(appointmentId);
      if (linkedAppointment && !finalChiefComplaint && linkedAppointment.chiefComplaint) {
        finalChiefComplaint = linkedAppointment.chiefComplaint;
      }
    }

    const type = visitType === 'specialist' ? 'specialist' : 'normal';

    // Validate attending doctor existence if attendingDoctorId is provided
    let verifiedAttendingDoctorName = attendingDoctor || '';
    let validAttendingDoctorId = null;

    if (attendingDoctorId) {
      const doctorUser = await User.findOne({
        _id: attendingDoctorId,
        isActive: { $ne: false },
        status: { $ne: 'Inactive' }
      });

      if (!doctorUser) {
        return res.status(400).json({ message: 'Selected attending doctor does not exist or is inactive' });
      }
      validAttendingDoctorId = doctorUser._id;
      if (!verifiedAttendingDoctorName) {
        verifiedAttendingDoctorName = doctorUser.name;
      }
    }

    // Validate consulting doctor existence if consultingDoctorId is provided
    let verifiedConsultingDoctorName = consultingDoctor || '';
    let validConsultingDoctorId = null;

    if (consultingDoctorId) {
      const consultingUser = await User.findOne({
        _id: consultingDoctorId,
        isActive: { $ne: false },
        status: { $ne: 'Inactive' }
      });

      if (!consultingUser) {
        return res.status(400).json({ message: 'Selected consulting doctor does not exist or is inactive' });
      }
      validConsultingDoctorId = consultingUser._id;
      if (!verifiedConsultingDoctorName) {
        verifiedConsultingDoctorName = consultingUser.name;
      }
    }

    // Atomic per-patient visit counter — never reused even if visits are deleted
    const visitNumber = await generateVisitNumber(patientId);

    const newDiagnosis = await Diagnosis.create({
      patient:            patientId,
      appointment:        linkedAppointment ? linkedAppointment._id : null,
      visitNumber,
      visitType:          type,
      visitDate:          visitDate ? new Date(visitDate) : new Date(),
      consultingDoctor:   verifiedConsultingDoctorName,
      consultingDoctorId: validConsultingDoctorId,
      attendingDoctor:    verifiedAttendingDoctorName,
      attendingDoctorId:  validAttendingDoctorId,
      chiefComplaint:     finalChiefComplaint,
      diagnosis:          diagnosis ? diagnosis.trim() : '',
      treatmentPerformed: treatmentPerformed ? treatmentPerformed.trim() : '',
      notes:              notes      || '',
      incentives:         incentives || '',
      consultingDoctorIncentive: type === 'specialist' ? (Number(consultingDoctorIncentive) || 0) : 0,
      attendingDoctorIncentive:  type === 'specialist' ? (Number(attendingDoctorIncentive) || 0) : 0,
      createdBy:          req.user ? req.user._id : null,
    });

    // Link newly created visit back to appointment and update status to 'Checked In'
    if (linkedAppointment) {
      linkedAppointment.visit = newDiagnosis._id;
      if (linkedAppointment.status !== 'Completed' && linkedAppointment.status !== 'Cancelled') {
        linkedAppointment.status = 'Checked In';
        linkedAppointment.actualCheckInTime = linkedAppointment.actualCheckInTime || new Date();
      }
      await linkedAppointment.save();
    }

    // Also sync to Patient document embedded arrays if clinical data provided
    const logDate = visitDate ? new Date(visitDate) : new Date();
    if (!patient.chiefComplaints) patient.chiefComplaints = [];
    if (!patient.diagnoses) patient.diagnoses = [];
    if (!patient.treatments) patient.treatments = [];

    if (chiefComplaint && chiefComplaint.trim()) {
      patient.chiefComplaints.push({ text: chiefComplaint.trim(), visitId: newDiagnosis._id, date: logDate });
    }
    if (diagnosis && diagnosis.trim()) {
      patient.diagnoses.push({ diagnosis: diagnosis.trim(), treatmentPlan: treatmentPerformed || '', date: logDate });
    }
    if (treatmentPerformed && treatmentPerformed.trim()) {
      patient.treatments.push({ name: treatmentPerformed.trim(), cost: 0, status: 'Completed', date: logDate });
    }
    await patient.save();

    const populated = await Diagnosis.findById(newDiagnosis._id)
      .populate('patient', 'patientId name phone')
      .populate('createdBy', 'name')
      .populate('attendingDoctorId', 'name employeeId specialization')
      .populate('consultingDoctorId', 'name employeeId specialization');

    res.status(201).json(populated);
  } catch (error) {
    console.error('Error creating diagnosis:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Log/Update a chief complaint for a specific visit
// @route   POST /api/diagnoses/complaint
// @access  Private
const logChiefComplaint = async (req, res) => {
  try {
    const { patientId, visitId, appointmentId, hasAppointment, complaint } = req.body;

    if (!patientId || !complaint || !complaint.trim()) {
      return res.status(400).json({ message: 'Patient and Complaint text are required' });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const recordedByName = req.user ? req.user.name : 'Staff';

    // If visitId provided, update Diagnosis document
    if (visitId) {
      const diagnosis = await Diagnosis.findOne({ _id: visitId, patient: patientId });
      if (diagnosis) {
        diagnosis.chiefComplaint = complaint.trim();
        await diagnosis.save();
      }
    }

    // If appointmentId provided, update Appointment document
    if (appointmentId) {
      const Appointment = require('../models/Appointment');
      const appt = await Appointment.findOne({ _id: appointmentId, patient: patientId });
      if (appt) {
        appt.chiefComplaint = complaint.trim();
        await appt.save();
      }
    }

    // Always append to Patient's chiefComplaints array
    if (!patient.chiefComplaints) patient.chiefComplaints = [];
    patient.chiefComplaints.push({
      text: complaint.trim(),
      visitId: visitId || null,
      appointmentId: appointmentId || null,
      hasAppointment: Boolean(hasAppointment || appointmentId),
      recordedBy: recordedByName,
      date: new Date(),
    });

    await patient.save();

    res.json({
      message: 'Chief complaint logged successfully',
      chiefComplaints: patient.chiefComplaints,
    });
  } catch (error) {
    console.error('Error logging chief complaint:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Log/Update diagnosis, treatment record, and outcome for a specific visit to complete/close encounter
// @route   POST /api/diagnoses/treatment
// @access  Private
const logTreatmentRecord = async (req, res) => {
  try {
    const {
      patientId,
      visitId,
      diagnosis: diagnosisText,
      treatmentPerformed,
      visitOutcome,
      followUpRequired,
      followUpType,
      referralNotes,
      chargedCost,
      treatmentStatus,
    } = req.body;

    if (!patientId || !visitId) {
      return res.status(400).json({ message: 'Patient ID and Visit ID are required' });
    }

    const diagnosisRecord = await Diagnosis.findOne({ _id: visitId, patient: patientId });
    if (!diagnosisRecord) {
      return res.status(404).json({ message: 'Selected visit not found for this patient' });
    }

    // Check mode: if isEdit is not true, and record is already closed/has treatment, reject duplicate creation
    const { isEdit } = req.body;
    if (!isEdit && diagnosisRecord.isClosed && diagnosisRecord.diagnosis && diagnosisRecord.diagnosis !== '—') {
      return res.status(400).json({ message: 'A Treatment Record already exists for this visit. Please edit the existing record instead.' });
    }

    // Update fields on the Visit document
    diagnosisRecord.diagnosis = diagnosisText ? diagnosisText.trim() : '';
    diagnosisRecord.treatmentPerformed = treatmentPerformed ? treatmentPerformed.trim() : '';
    if (chargedCost !== undefined && chargedCost !== null && chargedCost !== '') {
      diagnosisRecord.cost = Number(chargedCost);
    } else {
      diagnosisRecord.cost = 0;
    }
    if (treatmentStatus) {
      diagnosisRecord.treatmentStatus = treatmentStatus;
    }
    if (visitOutcome) {
      diagnosisRecord.visitOutcome = visitOutcome;
    }
    if (followUpRequired) {
      diagnosisRecord.followUpRequired = followUpRequired;
    }
    if (followUpType !== undefined) {
      diagnosisRecord.followUpType = followUpType;
    }
    if (referralNotes !== undefined) {
      diagnosisRecord.referralNotes = referralNotes;
    }

    // Mark visit encounter as completed / closed
    diagnosisRecord.isClosed = true;
    diagnosisRecord.status = 'Completed';

    await diagnosisRecord.save();

    // Auto-complete active queue entry and linked appointment upon consultation completion
    try {
      const Queue = require('../models/Queue');
      const Appointment = require('../models/Appointment');
      const linkedAppt = await Appointment.findOne({ visit: visitId });
      if (linkedAppt) {
        linkedAppt.status = 'Completed';
        await linkedAppt.save();
        await Queue.updateMany(
          { appointment: linkedAppt._id, status: { $in: ['Waiting', 'In Consultation'] } },
          { status: 'Completed', consultationEndTime: new Date() }
        );
      } else {
        await Queue.updateMany(
          { patient: patientId, status: { $in: ['Waiting', 'In Consultation'] } },
          { status: 'Completed', consultationEndTime: new Date() }
        );
      }
    } catch (queueErr) {
      console.error('Error auto-completing queue entry for visit:', queueErr);
    }

    // Also sync to Patient's diagnoses & treatments arrays
    const patient = await Patient.findById(patientId);
    if (patient) {
      if (!patient.diagnoses) patient.diagnoses = [];
      if (!patient.treatments) patient.treatments = [];

      const costNum = Number(chargedCost) || 0;
      const statusVal = treatmentStatus || 'Completed';
      const logDate = new Date();

      // Sync to patient.diagnoses array
      const existingDiagIdx = patient.diagnoses.findIndex(
        (d) => d.visitId && String(d.visitId) === String(visitId)
      );
      if (existingDiagIdx !== -1) {
        patient.diagnoses[existingDiagIdx].diagnosis = diagnosisRecord.diagnosis || 'Clinical Assessment';
        patient.diagnoses[existingDiagIdx].treatmentPlan = diagnosisRecord.treatmentPerformed || 'Consultation / Referral';
        patient.diagnoses[existingDiagIdx].date = logDate;
      } else if (diagnosisRecord.diagnosis || diagnosisRecord.treatmentPerformed) {
        patient.diagnoses.push({
          diagnosis: diagnosisRecord.diagnosis || 'Clinical Assessment',
          treatmentPlan: diagnosisRecord.treatmentPerformed || 'Consultation / Referral',
          visitId: diagnosisRecord._id,
          date: logDate,
        });
      }

      // Sync to patient.treatments array if treatment was performed
      if (diagnosisRecord.treatmentPerformed) {
        const existingTreatIdx = patient.treatments.findIndex(
          (t) => t.visitId && String(t.visitId) === String(visitId)
        );
        if (existingTreatIdx !== -1) {
          patient.treatments[existingTreatIdx].name = diagnosisRecord.treatmentPerformed;
          patient.treatments[existingTreatIdx].cost = costNum;
          patient.treatments[existingTreatIdx].status = statusVal === 'Referred' ? 'Completed' : statusVal;
          patient.treatments[existingTreatIdx].date = logDate;
        } else {
          patient.treatments.push({
            name: diagnosisRecord.treatmentPerformed,
            cost: costNum,
            status: statusVal === 'Referred' ? 'Completed' : statusVal,
            visitId: diagnosisRecord._id,
            date: logDate,
          });
        }
      }

      await patient.save();
    }

    const populated = await Diagnosis.findById(diagnosisRecord._id)
      .populate('patient', 'patientId name phone')
      .populate('createdBy', 'name')
      .populate('attendingDoctorId', 'name employeeId specialization')
      .populate('consultingDoctorId', 'name employeeId specialization');

    res.json(populated);
  } catch (error) {
    console.error('Error logging treatment record:', error);
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

// @desc    Clear ONLY Treatment Record details for a visit encounter
// @route   DELETE /api/diagnoses/:id
// @access  Private
const deleteDiagnosis = async (req, res) => {
  try {
    const diagnosisRecord = await Diagnosis.findById(req.params.id);
    if (!diagnosisRecord) {
      return res.status(404).json({ message: 'Visit record not found' });
    }

    const patientId = diagnosisRecord.patient;

    // Reset ONLY treatment record details on the Diagnosis (Visit) document
    diagnosisRecord.diagnosis = '';
    diagnosisRecord.treatmentPerformed = '';
    diagnosisRecord.cost = 0;
    diagnosisRecord.treatmentStatus = 'Not Started';
    diagnosisRecord.visitOutcome = 'Awaiting treatment record';
    diagnosisRecord.followUpRequired = 'No';
    diagnosisRecord.followUpType = '';
    diagnosisRecord.referralNotes = '';
    diagnosisRecord.isClosed = false;
    diagnosisRecord.status = 'Open';

    await diagnosisRecord.save();

    // Clear ONLY diagnosis and treatment entries for this visit in Patient embedded arrays
    // DO NOT touch chiefComplaints, Clinical Visit, Appointment, Patient, or Doctors!
    if (patientId) {
      const patient = await Patient.findById(patientId);
      if (patient) {
        if (patient.diagnoses) {
          patient.diagnoses = patient.diagnoses.filter(
            (d) => !d.visitId || String(d.visitId) !== String(req.params.id)
          );
        }
        if (patient.treatments) {
          patient.treatments = patient.treatments.filter(
            (t) => !t.visitId || String(t.visitId) !== String(req.params.id)
          );
        }
        await patient.save();
      }
    }

    res.json({ message: 'Treatment record cleared successfully' });
  } catch (error) {
    console.error('Error clearing treatment record:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getDiagnosesByPatient,
  createDiagnosis,
  logChiefComplaint,
  logTreatmentRecord,
  getDiagnosisById,
  deleteDiagnosis,
};

