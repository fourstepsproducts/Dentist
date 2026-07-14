const Appointment = require('../models/Appointment');

// @desc    Get appointments with optional patient filter
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
  try {
    const { patientId } = req.query;
    let query = {};

    if (patientId) {
      query.patient = patientId;
    }

    const appointments = await Appointment.find(query)
      .populate('patient')
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
    const { patient, date, status } = req.body;

    if (!patient || !date) {
      return res.status(400).json({ message: 'Patient and Date are required' });
    }

    const appointment = await Appointment.create({
      patient,
      date,
      status: status || 'Scheduled',
    });

    const populatedAppointment = await Appointment.findById(appointment._id).populate('patient');
    res.status(201).json(populatedAppointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getAppointments,
  createAppointment,
};
