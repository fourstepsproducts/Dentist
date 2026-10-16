const User = require('../models/User');

// @desc    Get active doctors (supports type=internal | external | all)
// @route   GET /api/doctors?type=internal|external|all
// @access  Private (Authenticated users)
const getActiveDoctors = async (req, res) => {
  try {
    const { type } = req.query;

    let queryFilter = {
      isActive: { $ne: false },
      status: { $ne: 'Inactive' }
    };

    if (type === 'internal') {
      // Staff Management internal doctors (Role = Doctor, not external doctor)
      queryFilter.isExternalDoctor = { $ne: true };
      queryFilter.role = { $regex: /^doctor$/i };
    } else if (type === 'external') {
      // Doctor Management external doctors (isExternalDoctor = true)
      queryFilter.isExternalDoctor = true;
    } else {
      // All active doctors
      queryFilter.$or = [
        { isExternalDoctor: true },
        { role: { $regex: /^doctor$/i } }
      ];
    }

    const doctors = await User.find(queryFilter)
      .sort({ name: 1 })
      .select('_id employeeId name role specialization department qualification status isActive isExternalDoctor');

    const formatted = doctors.map((doc) => ({
      _id: doc._id,
      doctorId: doc._id,
      employeeId: doc.employeeId || '',
      doctorName: doc.name,
      name: doc.name,
      role: doc.role || '',
      specialization: doc.specialization || doc.role || '',
      department: doc.department || '',
      qualification: doc.qualification || '',
      isExternalDoctor: doc.isExternalDoctor === true,
      status: doc.status || 'Active',
      isActive: doc.isActive !== false,
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Failed to fetch doctors list' });
  }
};

module.exports = {
  getActiveDoctors,
};
