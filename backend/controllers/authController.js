const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const Admin = require('../models/Admin');

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for admin first
    let user = await Admin.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      return res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: false,
        token: generateToken(user._id, user.role),
      });
    }

    // If not admin, check for normal user
    user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      if (user.status !== 'Active' && !user.isActive) {
        return res.status(401).json({ message: 'Account is inactive. Contact admin.' });
      }
      return res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
        token: generateToken(user._id, user.role),
      });
    }

    res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  loginUser,
};
