const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateEmployeeId } = require('../utils/generateEmployeeId');

// --- STAFF OPERATIONS ---

// @desc    Get all staff
// @route   GET /api/admin/staff
// @access  Private/Admin
const getStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: { $ne: 'admin' }, isExternalDoctor: { $ne: true } }).sort({ createdAt: -1 }).select('-password');
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new staff
// @route   POST /api/admin/staff
// @access  Private/Admin
const createStaff = async (req, res) => {
  try {
    const { name, email, password, role, phone, department, status, monthlySalary } = req.body;

    if (!name || !email || !password || !role || monthlySalary === undefined) {
      return res.status(400).json({ message: 'Please add all required fields including Monthly Salary' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let finalEmployeeId;
    let user;
    let retries = 3;

    while (retries > 0) {
      try {
        finalEmployeeId = await generateEmployeeId(role);
        user = await User.create({
          name,
          email,
          password: hashedPassword,
          role,
          phone: phone || '-',
          department: department || 'General',
          status: status || 'Active',
          employeeId: finalEmployeeId,
          isActive: status === 'Active' ? true : false,
          isExternalDoctor: false,
          monthlySalary: Number(monthlySalary)
        });
        break; // Break on success
      } catch (err) {
        if (err.code === 11000 && err.keyPattern && err.keyPattern.employeeId) {
          retries--;
          if (retries === 0) throw new Error('Could not generate unique Employee ID');
        } else {
          throw err;
        }
      }
    }

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        monthlySalary: user.monthlySalary
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update staff
// @route   PUT /api/admin/staff/:id
// @access  Private/Admin
const updateStaff = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    const { name, email, password, role, phone, department, status, monthlySalary } = req.body;
    
    // Check email uniqueness if email changed
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) return res.status(400).json({ message: 'Email already in use' });
    }

    let updatedData = { 
      name, 
      email, 
      role, 
      isActive: status === 'Active' ? true : false,
      phone,
      department,
      status,
      monthlySalary: monthlySalary !== undefined ? Number(monthlySalary) : undefined
    };

    Object.keys(updatedData).forEach(key => updatedData[key] === undefined && delete updatedData[key]);

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updatedData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete staff
// @route   DELETE /api/admin/staff/:id
// @access  Private/Admin
const deleteStaff = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    await user.deleteOne();
    res.json({ id: req.params.id, message: 'Staff removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};


// --- DOCTOR OPERATIONS ---

// @desc    Get all doctors
// @route   GET /api/admin/doctors
// @access  Private/Admin
const getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ isExternalDoctor: true }).sort({ createdAt: -1 }).select('-password');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new doctor
// @route   POST /api/admin/doctors
// @access  Private/Admin
const createDoctor = async (req, res) => {
  try {
    const { name, email, password, role, phone, specialization, qualification, experience, consultationFee, status } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please add all required fields including Specialist Role' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let finalEmployeeId;
    let user;
    let retries = 3;

    while (retries > 0) {
      try {
        finalEmployeeId = await generateEmployeeId(role);
        user = await User.create({
          name,
          email,
          password: hashedPassword,
          role,
          department: 'Clinical', // Auto assigned
          phone: phone || '-',
          status: status || 'Active',
          employeeId: finalEmployeeId,
          isActive: status === 'Active' ? true : false,
          isExternalDoctor: true,
          specialization: specialization || role,
          qualification,
          experience,
          consultationFee
        });
        break; // Break on success
      } catch (err) {
        if (err.code === 11000 && err.keyPattern && err.keyPattern.employeeId) {
          retries--;
          if (retries === 0) throw new Error('Could not generate unique Employee ID');
        } else {
          throw err;
        }
      }
    }

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update doctor
// @route   PUT /api/admin/doctors/:id
// @access  Private/Admin
const updateDoctor = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const { name, email, password, role, phone, specialization, qualification, experience, consultationFee, status } = req.body;
    
    // Check email uniqueness if email changed
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) return res.status(400).json({ message: 'Email already in use' });
    }

    let updatedData = { 
      name, 
      email, 
      role,
      isActive: status === 'Active' ? true : false,
      phone,
      status,
      specialization,
      qualification,
      experience,
      consultationFee
    };

    Object.keys(updatedData).forEach(key => updatedData[key] === undefined && delete updatedData[key]);

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updatedData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete doctor
// @route   DELETE /api/admin/doctors/:id
// @access  Private/Admin
const deleteDoctor = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    await user.deleteOne();
    res.json({ id: req.params.id, message: 'Doctor removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};


// --- DASHBOARD COUNTS ---

// @desc    Get counts for dashboard
// @route   GET /api/admin/dashboard/counts
// @access  Private/Admin
const getDashboardCounts = async (req, res) => {
  try {
    const totalDoctors = await User.countDocuments({ isExternalDoctor: true });
    const totalStaff = await User.countDocuments({ role: { $ne: 'admin' }, isExternalDoctor: { $ne: true } });
    
    res.json({
      totalDoctors,
      totalStaff
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};


module.exports = {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDashboardCounts
};
