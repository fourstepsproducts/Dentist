const Appointment = require('../models/Appointment');

/**
 * Automatically update overdue appointments:
 * 
 * Rules:
 * 1. Scheduled date & time have passed (date < now).
 * 2. No linked clinical visit exists (visit is null).
 * 3. Status is currently 'Scheduled'.
 * 4. Not already Checked In, In Consultation, Completed, Cancelled, or Missed.
 * 5. Not protected by manual override (isManualOverride !== true).
 */
const updateOverdueAppointments = async () => {
  try {
    const now = new Date();

    const result = await Appointment.updateMany(
      {
        status: 'Scheduled',
        date: { $lt: now },
        visit: null,
        isManualOverride: { $ne: true },
      },
      {
        $set: {
          status: 'Missed',
        },
      }
    );

    return {
      success: true,
      modifiedCount: result.modifiedCount || 0,
    };
  } catch (error) {
    console.error('[OverdueAppointments] Error updating overdue appointments:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Start periodic background runner for overdue appointments
 */
let intervalId = null;

const startOverdueAppointmentJob = (intervalMs = 60000) => {
  // Run once immediately on start
  updateOverdueAppointments();

  // Schedule recurring check
  if (!intervalId) {
    intervalId = setInterval(async () => {
      await updateOverdueAppointments();
    }, intervalMs);
  }
};

module.exports = {
  updateOverdueAppointments,
  startOverdueAppointmentJob,
};
