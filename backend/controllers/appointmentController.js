const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const { updateOverdueAppointments } = require('../services/appointmentStatusService');

// @desc    Get appointments with optional patient filter
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
  try {
    // Automatically update overdue appointments before returning
    await updateOverdueAppointments();

    const { patientId } = req.query;
    let query = {};

    if (patientId) {
      query.patient = patientId;
    }

    const appointments = await Appointment.find(query)
      .populate('patient')
      .populate('doctor', 'name specialization')
      .sort({ date: -1 });
      
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private
const createAppointment = async (req, res) => {
  try {
    const { patient, doctor, doctorName, date, chiefComplaint } = req.body;

    if (!patient || !date) {
      return res.status(400).json({ message: 'Patient and Date are required' });
    }

    const trimmedComplaint = chiefComplaint ? chiefComplaint.trim() : '';

    // Automatically set status to 'Scheduled' on creation
    const appointment = await Appointment.create({
      patient,
      doctor: doctor || null,
      doctorName: doctorName || '',
      date,
      status: 'Scheduled',
      isManualOverride: false,
      chiefComplaint: trimmedComplaint,
    });

    if (trimmedComplaint) {
      try {
        const patientDoc = await Patient.findById(patient);
        if (patientDoc) {
          if (!patientDoc.chiefComplaints) patientDoc.chiefComplaints = [];
          patientDoc.chiefComplaints.push({
            text: trimmedComplaint,
            appointmentId: appointment._id,
            hasAppointment: true,
            recordedBy: req.user ? req.user.name : (doctorName || 'Staff'),
            date: date || new Date(),
          });
          await patientDoc.save();
        }
      } catch (patientErr) {
        console.error('Error logging chief complaint to patient:', patientErr);
      }
    }

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient')
      .populate('doctor', 'name specialization');
      
    res.status(201).json(populatedAppointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update appointment status / details
// @route   PUT /api/appointments/:id/status
// @access  Private
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, doctor, doctorName, visit, isManualOverride } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (status) {
      const allowedStatuses = ['Scheduled', 'Checked In', 'In Consultation', 'Missed', 'Confirmed', 'Completed', 'Cancelled', 'No Show'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status: ${status}` });
      }

      appointment.status = status;

      const now = new Date();
      const isPast = new Date(appointment.date) < now;

      // Handle manual override preservation
      if (status === 'Scheduled' && isPast) {
        // Legitimate manual correction to Scheduled for past appointment
        appointment.isManualOverride = true;
        appointment.manualOverrideAt = now;
      } else if (status === 'Checked In') {
        appointment.actualCheckInTime = appointment.actualCheckInTime || now;
        appointment.isManualOverride = false;
      } else if (status === 'Missed') {
        appointment.isManualOverride = false;
      } else if (isManualOverride !== undefined) {
        appointment.isManualOverride = Boolean(isManualOverride);
      }
    }

    if (doctor) appointment.doctor = doctor;
    if (doctorName !== undefined) appointment.doctorName = doctorName;
    if (req.body.chiefComplaint !== undefined) appointment.chiefComplaint = req.body.chiefComplaint.trim();
    if (visit) appointment.visit = visit;

    await appointment.save();

    const populated = await Appointment.findById(appointment._id)
      .populate('patient')
      .populate('doctor', 'name specialization');

    res.json(populated);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getAppointments,
  createAppointment,
  updateAppointmentStatus,
};
