const Role = require('../models/Role');

// @desc    Get all active roles
// @route   GET /api/roles
// @access  Private
const getRoles = async (req, res) => {
  try {
    const roles = await Role.find({ status: 'Active' }).sort({ name: 1 });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new role
// @route   POST /api/roles
// @access  Private/Admin
const createRole = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Role name is required' });
    }

    const roleExists = await Role.findOne({ name: { $regex: `^${name.trim()}$`, $options: 'i' } });
    if (roleExists) {
      return res.status(400).json({ message: 'Role already exists' });
    }

    const role = await Role.create({
      name: name.trim(),
      description: description || '',
      status: status || 'Active'
    });

    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getRoles,
  createRole
};
