const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: '-',
    },
    department: {
      type: String,
      default: 'General',
    },
    status: {
      type: String,
      default: 'Active',
    },
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    specialization: {
      type: String,
    },
    qualification: {
      type: String,
    },
    experience: {
      type: Number,
    },
    consultationFee: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
