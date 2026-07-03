const bcrypt = require('bcryptjs');
const User = require('../models/User');

// @desc    Create a new user
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, department, status, employeeId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please add all required fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate employeeId if not provided
    const finalEmployeeId = employeeId || `STF${Math.floor(1000 + Math.random() * 9000)}`;

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone: phone || '-',
      department: department || 'General',
      status: status || 'Active',
      employeeId: finalEmployeeId,
      isActive: status === 'Active' ? true : false,
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        department: user.department,
        status: user.status,
        employeeId: user.employeeId,
        isActive: user.isActive,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all staff
// @route   GET /api/users/staff
// @access  Private/Admin
const getAllStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 }).select('-password');
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get users by role
// @route   GET /api/users/:role
// @access  Private/Admin
const getUsersByRole = async (req, res) => {
  try {
    const users = await User.find({ role: req.params.role }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email, password, role, isActive, phone, department, status, employeeId } = req.body;
    
    // Resolve isActive / status sync
    let finalIsActive = isActive;
    if (status !== undefined) {
      finalIsActive = status === 'Active' ? true : false;
    }
    
    let updatedData = { 
      name, 
      email, 
      role, 
      isActive: finalIsActive,
      phone,
      department,
      status,
      employeeId
    };

    // Remove undefined values
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

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();
    res.json({ id: req.params.id, message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createUser,
  getAllStaff,
  getUsersByRole,
  updateUser,
  deleteUser,
};
