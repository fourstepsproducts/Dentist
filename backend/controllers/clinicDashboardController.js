const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Queue = require('../models/Queue');

// @desc    Get clinic dashboard summary statistics
// @route   GET /api/clinic-dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments({ isDeleted: { $ne: true } });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayAppointments = await Appointment.countDocuments({
      date: {
        $gte: startOfToday,
        $lte: endOfToday,
      },
    });

    const queueWaiting = await Queue.countDocuments({ status: 'Waiting' });
    const apptWaiting = await Appointment.countDocuments({
      status: { $in: ['Waiting', 'Checked In'] },
      date: {
        $gte: startOfToday,
        $lte: endOfToday,
      },
    });

    const waitingPatients = Math.max(queueWaiting, apptWaiting);

    res.json({
      totalPatients: totalPatients || 0,
      todayAppointments: todayAppointments || 0,
      waitingPatients: waitingPatients || 0,
    });
  } catch (error) {
    console.error('Error fetching clinic dashboard stats:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getDashboardStats,
};
