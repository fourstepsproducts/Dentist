const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    doctorName: {
      type: String,
      trim: true,
      default: '',
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Checked In', 'In Consultation', 'Missed', 'Confirmed', 'Completed', 'Cancelled', 'No Show'],
      default: 'Scheduled',
    },
    actualCheckInTime: {
      type: Date,
      default: null,
    },
    chiefComplaint: {
      type: String,
      trim: true,
      default: '',
    },
    visit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Diagnosis',
      default: null,
    },
    isManualOverride: {
      type: Boolean,
      default: false,
    },
    manualOverrideAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
