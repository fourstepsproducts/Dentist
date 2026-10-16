const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
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
    tokenNumber: {
      type: Number,
      required: true,
    },
    tokenDisplay: {
      type: String,
      required: true,
      trim: true,
    },
    queueSessionDate: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      index: true,
    },
    checkInTime: {
      type: Date,
      default: Date.now,
    },
    consultationStartTime: {
      type: Date,
      default: null,
    },
    consultationEndTime: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Waiting', 'In Consultation', 'Completed', 'Cancelled'],
      default: 'Waiting',
      index: true,
    },
    isEmergency: {
      type: Boolean,
      default: false,
    },
    emergencyNotes: {
      type: String,
      trim: true,
      default: '',
    },
    chiefComplaint: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index to quickly look up active patients for a session & doctor
queueSchema.index({ queueSessionDate: 1, status: 1, doctor: 1 });
queueSchema.index({ appointment: 1, status: 1 });

module.exports = mongoose.model('Queue', queueSchema);
