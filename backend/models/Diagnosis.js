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
    consultingDoctor: { type: String, trim: true, default: '' },

    // Always populated — the doctor who treated the patient
    attendingDoctor:  { type: String, trim: true, default: '' },

    // ── Core Clinical Fields (both types) ─────────────────────────────────
    chiefComplaint:     { type: String, required: true, trim: true },
    diagnosis:          { type: String, required: true, trim: true },
    treatmentPerformed: { type: String, required: true, trim: true },

    // ── Optional Fields (both types) ─────────────────────────────────────
    notes:      { type: String, trim: true, default: '' },
    incentives: { type: String, trim: true, default: '' },

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
