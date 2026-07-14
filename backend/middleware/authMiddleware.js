const jwt = require('jsonwebtoken');
const User = require('../models/User');

const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      let user = await Admin.findById(decoded.id).select('-password');
      if (!user) {
        user = await User.findById(decoded.id).select('-password');
      }
      
      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      req.user = user;

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Role authorization middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    console.log(`[AUTH DEBUG] Required roles: ${roles}`);
    console.log(`[AUTH DEBUG] User found: ${req.user ? req.user.email : 'No user'}`);
    console.log(`[AUTH DEBUG] User role: ${req.user ? req.user.role : 'No role'}`);
    
    if (!req.user || !roles.includes(req.user.role)) {
      console.log(`[AUTH DEBUG] FAILED - returning 403`);
      return res.status(403).json({
        message: `Role (${req.user ? req.user.role : 'none'}) is not allowed to access this resource`,
      });
    }
    console.log(`[AUTH DEBUG] PASSED`);
    next();
  };
};

module.exports = { protect, authorizeRoles };
