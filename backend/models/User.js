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
    
    // Additional Personal Info
    gender: { type: String },
    dateOfBirth: { type: Date },
    bloodGroup: { type: String },
    alternateMobile: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    pincode: { type: String },

    // Additional Professional Info
    licenseNumber: { type: String },
    shiftTiming: { type: String },
    reportingManager: { type: String },
    employmentType: { type: String },

    // Security Info
    mustChangePassword: {
      type: Boolean,
      default: true,
    },
    passwordChangedAt: {
      type: Date,
    },
    lastLogin: {
      type: Date,
    },

    // Emergency Contact
    emergencyContact: {
      contactPerson: { type: String },
      relationship: { type: String },
      phoneNumber: { type: String }
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
