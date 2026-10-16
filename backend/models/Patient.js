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
        visitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Diagnosis', default: null },
        appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
        hasAppointment: { type: Boolean, default: false },
        recordedBy: { type: String, default: '' },
        date: { type: Date, default: Date.now },
      },
    ],
    diagnoses: [
      {
        diagnosis: { type: String, required: true },
        treatmentPlan: { type: String, required: true },
        visitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Diagnosis', default: null },
        date: { type: Date, default: Date.now },
      },
    ],
    treatments: [
      {
        name: { type: String, required: true },
        cost: { type: Number, required: true },
        status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
        visitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Diagnosis', default: null },
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

    // ── Soft Delete Fields ──────────────────────────────────────────
    // Records are NEVER permanently deleted. Instead:
    //   isDeleted = true  → hidden from normal listings
    //   deletedAt         → timestamp of when it was deleted
    //   deletedBy         → which user performed the delete
    // This preserves audit trails, appointment references, invoices, etc.
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,          // fast filtering in queries
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Patient', patientSchema);
