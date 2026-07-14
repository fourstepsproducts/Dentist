const Specialization = require('../models/Specialization');

// @desc    Get all specializations
// @route   GET /api/specializations
// @access  Private
const getSpecializations = async (req, res) => {
  try {
    const specializations = await Specialization.find({}).sort({ name: 1 });
    res.json(specializations);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new specialization
// @route   POST /api/specializations
// @access  Private
const createSpecialization = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Specialization name is required' });
    }

    const exists = await Specialization.findOne({
      name: { $regex: `^${name.trim()}$`, $options: 'i' },
    });

    if (exists) {
      return res.status(400).json({ message: 'Specialization already exists' });
    }

    const specialization = await Specialization.create({ name: name.trim() });
    res.status(201).json(specialization);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getSpecializations,
  createSpecialization,
};
