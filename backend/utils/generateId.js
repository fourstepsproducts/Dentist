const Counter = require('../models/Counter');

/**
 * generateId  —  Atomic Sequential ID Generator
 * ------------------------------------------------
 * Uses MongoDB's findOneAndUpdate with $inc to atomically increment
 * a counter and return the new value in a single database operation.
 *
 * This is the professional approach used in enterprise, ERP, banking,
 * and hospital management systems.
 *
 * HOW IT WORKS
 * ─────────────
 * The Counters collection has one document per entity:
 *
 *   { _id: 'patient',  seq: 1023 }
 *   { _id: 'staff',    seq: 204  }
 *   { _id: 'doctor',   seq: 56   }
 *
 * On every call:
 *   1. MongoDB atomically increments seq by 1 in the Counter document.
 *   2. Returns the incremented value.
 *   3. We format it as PAT-0001, OD-DOC-0001, etc.
 *
 * WHY THIS IS CORRECT
 * ────────────────────
 * ✅ Atomic — no race condition if two requests arrive simultaneously.
 *    MongoDB handles the increment as a single server-side operation.
 * ✅ Deleted records don't affect future IDs — counter only goes forward.
 * ✅ Gaps are expected and acceptable (PAT-0001, PAT-0003 if 0002 deleted).
 * ✅ No scanning of Patient/User collections needed.
 * ✅ Works correctly at any scale.
 *
 * @param {string} entityKey  - Counter key: 'patient' | 'staff' | 'doctor'
 * @returns {Promise<number>} - The next unique sequential number
 */
const getNextSequence = async (entityKey) => {
  const result = await Counter.findOneAndUpdate(
    { _id: entityKey },          // find the counter document for this entity
    { $inc: { seq: 1 } },        // atomically increment seq by 1
    {
      new: true,                 // return the document AFTER the update
      upsert: true,              // create the counter document if it doesn't exist yet
    }
  );
  return result.seq;
};

// ── Role prefix mapping for Employee IDs ────────────────────────────────────
const ROLE_PREFIXES = {
  'doctor':        'DOC',
  'receptionist':  'REC',
  'nurse':         'NUR',
  'lab staff':     'LAB',
  'accountant':    'ACC',
  'pharmacist':    'PHA',
  'admin staff':   'ADM',
  'cleaner':       'CLN',
  'security':      'SEC',
};

const getRoleCode = (role) => {
  if (!role) return 'EMP';
  const lower = role.toLowerCase().trim();
  if (ROLE_PREFIXES[lower]) return ROLE_PREFIXES[lower];
  // Fallback: first 3 uppercase letters of the role
  return role.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 3).padEnd(3, 'X');
};

/**
 * generatePatientId  —  e.g. "PAT-0001", "PAT-0042"
 * Each call atomically increments the 'patient' counter.
 */
const generatePatientId = async () => {
  const seq = await getNextSequence('patient');
  return `PAT-${String(seq).padStart(4, '0')}`;
};

/**
 * generateEmployeeId  —  e.g. "OD-DOC-0001", "OD-REC-0005"
 * Each role uses its own counter key (e.g. 'staff_DOC', 'staff_REC').
 * This way DOC numbers and REC numbers are independent.
 *
 * @param {string} role  - The staff role name
 */
const generateEmployeeId = async (role) => {
  const roleCode = getRoleCode(role);
  const counterKey = `staff_${roleCode}`;           // e.g. 'staff_DOC'
  const seq = await getNextSequence(counterKey);
  return `OD-${roleCode}-${String(seq).padStart(4, '0')}`;
};

/**
 * generateVisitNumber  —  Per-patient sequential visit counter
 * ─────────────────────────────────────────────────────────────
 * Each patient gets their own counter: 'visit_<patientId>'
 * Patient A: Visit #1, #2, #3 …
 * Patient B: Visit #1, #2, #3 …  (independent series)
 *
 * ✅ Atomic — no duplicate visit numbers even under concurrent saves
 * ✅ Deleting a visit record never affects future visit numbers
 * ✅ Each patient's visit history is cleanly numbered from 1
 *
 * @param {string} patientId  - MongoDB _id of the patient (ObjectId as string)
 * @returns {Promise<number>} - The next visit number for this patient
 */
const generateVisitNumber = async (patientId) => {
  return await getNextSequence(`visit_${patientId}`);
};

module.exports = {
  getNextSequence,
  generatePatientId,
  generateEmployeeId,
  generateVisitNumber,
  getRoleCode,
};
