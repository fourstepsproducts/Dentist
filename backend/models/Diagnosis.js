const mongoose = require('mongoose');

/**
 * Diagnosis (Clinical Visit) Model
 * ──────────────────────────────────
 * Each document = ONE clinical visit for ONE patient.
 *
 * Two visit types:
 *   'normal'     — Attending Doctor only (standard case)
 *   'specialist' — Consulting Doctor + Attending Doctor
 *
 * The ONLY difference between the two types is whether a
 * Consulting Doctor (specialist) was involved before treatment.
 */
const diagnosisSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },

    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
    },

    // Per-patient sequential number — never reused, never reset
    visitNumber: {
      type: Number,
      required: true,
    },

    visitDate: {
      type: Date,
      default: Date.now,
      required: true,
    },

    // ── Visit Type ────────────────────────────────────────────────────────
    // 'normal'     → only Attending Doctor
    // 'specialist' → Consulting Doctor first, then Attending Doctor
    visitType: {
      type: String,
      enum: ['normal', 'specialist'],
      default: 'normal',
      required: true,
    },

    // ── Doctors ───────────────────────────────────────────────────────────
    // Only populated for 'specialist' visits
    consultingDoctor:   { type: String, trim: true, default: '' },
    consultingDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // Always populated — the doctor who treated the patient
    attendingDoctor:   { type: String, trim: true, default: '' },
    attendingDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // ── Core Clinical Fields & Outcome ─────────────────────────────────
    chiefComplaint:     { type: String, trim: true, default: '' },
    diagnosis:          { type: String, trim: true, default: '' },
    treatmentPerformed: { type: String, trim: true, default: '' },
    cost:               { type: Number, default: 0 },
    treatmentStatus:    { 
      type: String, 
      enum: ['Not Started', 'In Progress', 'Partially Completed', 'Completed', 'Referred', 'Pending'], 
      default: 'Not Started' 
    },
    visitOutcome:       {
      type: String,
      default: 'Awaiting treatment record'
    },
    followUpRequired:   { type: String, enum: ['Yes', 'No'], default: 'No' },
    followUpType:       { type: String, trim: true, default: '' },
    referralNotes:      { type: String, trim: true, default: '' },
    isClosed:           { type: Boolean, default: false },
    status:             { type: String, default: 'Open' },

    // ── Optional Fields ──────────────────────────────────────────────────
    notes:      { type: String, trim: true, default: '' },
    incentives: { type: String, trim: true, default: '' }, // For backward compatibility / general incentive note
    consultingDoctorIncentive: { type: Number, default: 0 },
    attendingDoctorIncentive:  { type: Number, default: 0 },

    // Who logged this visit
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// Fast queries: all visits for a patient ordered by visit number
diagnosisSchema.index({ patient: 1, visitNumber: -1 });

module.exports = mongoose.model('Diagnosis', diagnosisSchema);
