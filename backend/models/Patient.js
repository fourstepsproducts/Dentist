const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ['Male', 'Female', 'Other'],
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    emergencyContact: {
      name: { type: String, trim: true },
      relationship: { type: String, trim: true },
      phone: { type: String, trim: true },
    },
    chiefComplaints: [
      {
        text: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
    diagnoses: [
      {
        diagnosis: { type: String, required: true },
        treatmentPlan: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
    treatments: [
      {
        name: { type: String, required: true },
        cost: { type: Number, required: true },
        status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
        date: { type: Date, default: Date.now },
      },
    ],
    documents: [
      {
        name: { type: String, required: true },
        type: { type: String, required: true },
        uploadDate: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Patient', patientSchema);
