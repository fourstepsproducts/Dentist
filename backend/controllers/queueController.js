const Queue = require('../models/Queue');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const User = require('../models/User');
const { generateQueueToken } = require('../utils/generateId');
const { updateOverdueAppointments } = require('../services/appointmentStatusService');

/**
 * Helper to get local date string YYYY-MM-DD
 */
const getTodayDateStr = (date = new Date()) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    Get eligible appointments for the queue table (Scheduled & Missed not yet checked in)
// @route   GET /api/queue
// @access  Private
const getQueue = async (req, res) => {
  try {
    // 1. Automatically evaluate overdue appointments before building queue
    await updateOverdueAppointments();

    const { doctorId } = req.query;

    // 2. Query eligible appointments:
    // Include: 'Scheduled' and 'Missed'
    // Exclude: 'Checked In', 'In Consultation', 'Completed', 'Cancelled'
    let filter = {
      status: { $in: ['Scheduled', 'Missed'] },
      visit: null,
    };

    if (doctorId && doctorId !== 'all') {
      filter.doctor = doctorId;
    }

    const appointments = await Appointment.find(filter)
      .populate('patient', 'patientId name phone gender dateOfBirth createdAt isDeleted')
      .populate('doctor', 'name specialization employeeId')
      .lean();

    // 3. Filter out soft-deleted patients
    const eligible = appointments.filter((appt) => appt.patient && !appt.patient.isDeleted);

    // 4. SORTING:
    // PRIMARY RULE:
    // Patient registered earliest receives lowest serial number (oldest patient registration first).
    // Tie-breaker 1: Appointment creation timestamp
    // Tie-breaker 2: Stable unique identifier
    eligible.sort((a, b) => {
      const regTimeA = a.patient?.createdAt ? new Date(a.patient.createdAt).getTime() : 0;
      const regTimeB = b.patient?.createdAt ? new Date(b.patient.createdAt).getTime() : 0;

      if (regTimeA !== regTimeB) {
        return regTimeA - regTimeB;
      }

      const apptCreatedA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const apptCreatedB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

      if (apptCreatedA !== apptCreatedB) {
        return apptCreatedA - apptCreatedB;
      }

      return String(a._id).localeCompare(String(b._id));
    });

    // 5. Dynamically calculate serial numbers (1, 2, 3...)
    const queueList = eligible.map((appt, index) => ({
      ...appt,
      serialNumber: index + 1,
    }));

    const stats = {
      total: queueList.length,
      scheduled: queueList.filter((i) => i.status === 'Scheduled').length,
      missed: queueList.filter((i) => i.status === 'Missed').length,
    };

    res.json({
      success: true,
      stats,
      queue: queueList,
    });
  } catch (error) {
    console.error('Error fetching queue:', error);
    res.status(500).json({ message: 'Failed to fetch queue records' });
  }
};

// @desc    Check in patient and create queue entry
// @route   POST /api/queue/checkin
// @access  Private
const checkInPatient = async (req, res) => {
  try {
    const {
      appointmentId,
      patientId,
      doctorId,
      doctorName,
      isEmergency,
      emergencyNotes,
      chiefComplaint,
      notes,
    } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ message: 'Appointment ID is required for check-in.' });
    }

    const appointment = await Appointment.findById(appointmentId).populate('patient');
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment record not found.' });
    }

    // Validation: Cancelled appointment
    if (appointment.status === 'Cancelled') {
      return res.status(400).json({
        message: 'Cannot check in a cancelled appointment. Please schedule a new appointment or restore it.',
      });
    }

    // Validation: Completed appointment
    if (appointment.status === 'Completed') {
      return res.status(400).json({
        message: 'This appointment has already been completed.',
      });
    }

    const todayStr = getTodayDateStr();

    // Concurrency / duplicate prevention: Check if already in active queue for this appointment
    const existingActiveForAppt = await Queue.findOne({
      appointment: appointmentId,
      status: { $in: ['Waiting', 'In Consultation'] },
    });

    if (existingActiveForAppt) {
      return res.status(409).json({
        message: `Patient is already in the active queue with Token ${existingActiveForAppt.tokenDisplay} (${existingActiveForAppt.status}).`,
        existingQueue: existingActiveForAppt,
      });
    }

    // Check if patient already has another active queue entry today
    const existingActiveForPatient = await Queue.findOne({
      patient: appointment.patient._id || appointment.patient,
      queueSessionDate: todayStr,
      status: { $in: ['Waiting', 'In Consultation'] },
    });

    if (existingActiveForPatient) {
      return res.status(409).json({
        message: `Patient already has an active queue entry today with Token ${existingActiveForPatient.tokenDisplay}.`,
        existingQueue: existingActiveForPatient,
      });
    }

    // Determine Doctor
    let resolvedDoctorId = doctorId || appointment.doctor || null;
    let resolvedDoctorName = doctorName || appointment.doctorName || '';

    if (resolvedDoctorId && !resolvedDoctorName) {
      const docUser = await User.findById(resolvedDoctorId).select('name');
      if (docUser) resolvedDoctorName = docUser.name;
    }

    // Generate atomic sequential token for today's session
    const tokenObj = await generateQueueToken(todayStr);

    const checkInTimestamp = new Date();

    // Preserve original appointment date/time!
    // Update appointment status to 'Checked In' and record actualCheckInTime
    appointment.status = 'Checked In';
    appointment.actualCheckInTime = checkInTimestamp;
    if (chiefComplaint && !appointment.chiefComplaint) {
      appointment.chiefComplaint = chiefComplaint.trim();
    }
    if (resolvedDoctorId && !appointment.doctor) {
      appointment.doctor = resolvedDoctorId;
      appointment.doctorName = resolvedDoctorName;
    }
    await appointment.save();

    // Create Queue entry
    const newQueueEntry = await Queue.create({
      patient: appointment.patient._id || appointment.patient,
      appointment: appointment._id,
      doctor: resolvedDoctorId,
      doctorName: resolvedDoctorName,
      tokenNumber: tokenObj.tokenNumber,
      tokenDisplay: tokenObj.tokenDisplay,
      queueSessionDate: todayStr,
      checkInTime: checkInTimestamp,
      status: 'Waiting',
      isEmergency: Boolean(isEmergency),
      emergencyNotes: emergencyNotes ? emergencyNotes.trim() : '',
      chiefComplaint: chiefComplaint ? chiefComplaint.trim() : (appointment.chiefComplaint || ''),
      notes: notes ? notes.trim() : '',
      checkedInBy: req.user ? req.user._id : null,
    });

    const populated = await Queue.findById(newQueueEntry._id)
      .populate('patient', 'patientId name phone gender dateOfBirth')
      .populate('appointment', 'date status chiefComplaint doctor doctorName actualCheckInTime')
      .populate('doctor', 'name specialization employeeId')
      .populate('checkedInBy', 'name employeeId');

    res.status(201).json({
      message: `Checked in successfully. Token: ${tokenObj.tokenDisplay}`,
      queueItem: populated,
    });
  } catch (error) {
    console.error('Error during patient check-in:', error);
    res.status(500).json({ message: error.message || 'Server error during check-in.' });
  }
};

// @desc    Call next patient for a doctor
// @route   POST /api/queue/call-next
// @access  Private
const callNextPatient = async (req, res) => {
  try {
    const { doctorId, overrideBusy } = req.body;

    if (!doctorId) {
      return res.status(400).json({ message: 'Please select a specific doctor to call the next patient.' });
    }

    const todayStr = getTodayDateStr();

    // Check if the doctor is currently attending another patient
    const activeConsultation = await Queue.findOne({
      doctor: doctorId,
      queueSessionDate: todayStr,
      status: 'In Consultation',
    }).populate('patient', 'name patientId');

    if (activeConsultation && !overrideBusy) {
      return res.status(409).json({
        message: `Doctor is currently attending ${activeConsultation.patient?.name} (Token ${activeConsultation.tokenDisplay}). Please complete the current consultation before calling the next patient.`,
        isBusy: true,
        currentConsultation: activeConsultation,
      });
    }

    // Fetch waiting patients for this doctor
    const waitingItems = await Queue.find({
      doctor: doctorId,
      queueSessionDate: todayStr,
      status: 'Waiting',
    })
      .populate('patient', 'patientId name phone gender dateOfBirth')
      .populate('appointment', 'date status chiefComplaint');

    if (waitingItems.length === 0) {
      return res.status(404).json({ message: 'No eligible waiting patients in queue for this doctor.' });
    }

    // Sort to find the highest-priority eligible waiting patient
    waitingItems.sort((a, b) => {
      // Emergency first
      if (a.isEmergency && !b.isEmergency) return -1;
      if (!a.isEmergency && b.isEmergency) return 1;

      if (a.isEmergency && b.isEmergency) {
        return new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime();
      }

      // Appointment date/time ascending
      const apptA = a.appointment?.date ? new Date(a.appointment.date).getTime() : new Date(a.checkInTime).getTime();
      const apptB = b.appointment?.date ? new Date(b.appointment.date).getTime() : new Date(b.checkInTime).getTime();

      if (apptA !== apptB) {
        return apptA - apptB;
      }

      return new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime();
    });

    const nextPatient = waitingItems[0];

    // Transition selected patient to 'In Consultation'
    nextPatient.status = 'In Consultation';
    nextPatient.consultationStartTime = new Date();
    await nextPatient.save();

    // Transition linked appointment status
    if (nextPatient.appointment) {
      await Appointment.findByIdAndUpdate(nextPatient.appointment._id, {
        status: 'In Consultation',
      });
    }

    res.json({
      message: `Patient ${nextPatient.patient?.name} (Token ${nextPatient.tokenDisplay}) called into consultation.`,
      calledPatient: nextPatient,
    });
  } catch (error) {
    console.error('Error calling next patient:', error);
    res.status(500).json({ message: 'Failed to call next patient.' });
  }
};

// @desc    Call in a specific patient from waiting queue
// @route   PUT /api/queue/:id/call-in
// @access  Private
const callSpecificPatient = async (req, res) => {
  try {
    const queueItem = await Queue.findById(req.params.id)
      .populate('patient', 'name patientId')
      .populate('doctor', 'name');

    if (!queueItem) {
      return res.status(404).json({ message: 'Queue item not found.' });
    }

    if (queueItem.status === 'In Consultation') {
      return res.status(400).json({ message: 'Patient is already in consultation.' });
    }

    if (queueItem.status === 'Completed') {
      return res.status(400).json({ message: 'Patient consultation is already completed.' });
    }

    queueItem.status = 'In Consultation';
    queueItem.consultationStartTime = new Date();
    await queueItem.save();

    if (queueItem.appointment) {
      await Appointment.findByIdAndUpdate(queueItem.appointment, {
        status: 'In Consultation',
      });
    }

    res.json({
      message: `Patient ${queueItem.patient?.name} (Token ${queueItem.tokenDisplay}) transitioned to consultation.`,
      queueItem,
    });
  } catch (error) {
    console.error('Error starting consultation:', error);
    res.status(500).json({ message: 'Failed to transition patient to consultation.' });
  }
};

// @desc    Complete consultation for a patient
// @route   PUT /api/queue/:id/complete
// @access  Private
const completeConsultation = async (req, res) => {
  try {
    const queueItem = await Queue.findById(req.params.id)
      .populate('patient', 'name patientId');

    if (!queueItem) {
      return res.status(404).json({ message: 'Queue entry not found.' });
    }

    queueItem.status = 'Completed';
    queueItem.consultationEndTime = new Date();
    await queueItem.save();

    // Mark linked appointment completed
    if (queueItem.appointment) {
      await Appointment.findByIdAndUpdate(queueItem.appointment, {
        status: 'Completed',
      });
    }

    res.json({
      message: `Consultation completed for Token ${queueItem.tokenDisplay}. Removed from active waiting queue.`,
      queueItem,
    });
  } catch (error) {
    console.error('Error completing consultation:', error);
    res.status(500).json({ message: 'Failed to complete consultation.' });
  }
};

// @desc    Cancel / remove queue entry
// @route   PUT /api/queue/:id/cancel
// @access  Private
const cancelQueueEntry = async (req, res) => {
  try {
    const queueItem = await Queue.findById(req.params.id);
    if (!queueItem) {
      return res.status(404).json({ message: 'Queue entry not found.' });
    }

    queueItem.status = 'Cancelled';
    await queueItem.save();

    // Revert appointment status back to 'Scheduled'
    if (queueItem.appointment) {
      await Appointment.findByIdAndUpdate(queueItem.appointment, {
        status: 'Scheduled',
      });
    }

    res.json({ message: `Token ${queueItem.tokenDisplay} removed from queue.` });
  } catch (error) {
    console.error('Error cancelling queue entry:', error);
    res.status(500).json({ message: 'Failed to cancel queue entry.' });
  }
};

// @desc    Toggle emergency status for a queue entry
// @route   PUT /api/queue/:id/emergency
// @access  Private
const toggleEmergency = async (req, res) => {
  try {
    const { isEmergency, emergencyNotes } = req.body;
    const queueItem = await Queue.findById(req.params.id);

    if (!queueItem) {
      return res.status(404).json({ message: 'Queue entry not found.' });
    }

    queueItem.isEmergency = isEmergency !== undefined ? Boolean(isEmergency) : !queueItem.isEmergency;
    if (emergencyNotes !== undefined) {
      queueItem.emergencyNotes = emergencyNotes.trim();
    }
    await queueItem.save();

    res.json({
      message: `Emergency status updated for Token ${queueItem.tokenDisplay}.`,
      queueItem,
    });
  } catch (error) {
    console.error('Error toggling emergency:', error);
    res.status(500).json({ message: 'Failed to update emergency status.' });
  }
};

// @desc    Get check-in candidate appointments for a patient (today's, late, historical missed)
// @route   GET /api/queue/patient-appointments/:patientId
// @access  Private
const getPatientCheckInCandidates = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Find appointments that are not cancelled or completed
    const appointments = await Appointment.find({
      patient: patientId,
      status: { $nin: ['Cancelled', 'Completed'] },
    })
      .populate('doctor', 'name specialization')
      .sort({ date: -1 });

    const todayStr = getTodayDateStr();

    // Check if any appointment is already in active queue
    const activeQueueItems = await Queue.find({
      patient: patientId,
      status: { $in: ['Waiting', 'In Consultation'] },
      queueSessionDate: todayStr,
    });

    const activeApptIdMap = {};
    activeQueueItems.forEach((q) => {
      activeApptIdMap[String(q.appointment)] = q;
    });

    const formatted = appointments.map((appt) => {
      const apptDateStr = getTodayDateStr(appt.date);
      const isPast = apptDateStr < todayStr;
      const isToday = apptDateStr === todayStr;
      const isFuture = apptDateStr > todayStr;
      const isMissed = appt.status === 'Missed' || appt.status === 'No Show' || (isPast && appt.status === 'Scheduled');
      const activeQueue = activeApptIdMap[String(appt._id)] || null;

      return {
        _id: appt._id,
        date: appt.date,
        doctor: appt.doctor,
        doctorName: appt.doctorName || appt.doctor?.name || '—',
        status: appt.status,
        chiefComplaint: appt.chiefComplaint || '',
        isToday,
        isPast,
        isFuture,
        isMissed,
        activeQueue,
        canCheckIn: !activeQueue && appt.status !== 'Completed',
      };
    });

    res.json({
      patient,
      appointments: formatted,
    });
  } catch (error) {
    console.error('Error fetching check-in candidates:', error);
    res.status(500).json({ message: 'Failed to fetch check-in candidate appointments.' });
  }
};

module.exports = {
  getQueue,
  checkInPatient,
  callNextPatient,
  callSpecificPatient,
  completeConsultation,
  cancelQueueEntry,
  toggleEmergency,
  getPatientCheckInCandidates,
};
