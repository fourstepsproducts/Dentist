const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');

// @desc    Get clinic dashboard summary statistics
// @route   GET /api/clinic-dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments({});

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

    const waitingPatients = await Appointment.countDocuments({
      status: 'Waiting',
      date: {
        $gte: startOfToday,
        $lte: endOfToday,
      },
    });

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
