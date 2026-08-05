const mongoose = require('mongoose');

/**
 * Counter Collection
 * ------------------
 * One document per entity that needs sequential IDs:
 *
 *   { _id: 'patient',  seq: 1023 }
 *   { _id: 'doctor',   seq: 56   }
 *   { _id: 'staff',    seq: 204  }
 *
 * The `seq` field stores the LAST ISSUED number.
 * To get the next ID, we atomically increment seq by 1 and read the result.
 *
 * This guarantees:
 *   ✅ No duplicate IDs, even under concurrent requests
 *   ✅ IDs always increase — deleting records never affects future IDs
 *   ✅ Gaps in numbering are expected and acceptable
 *   ✅ Works correctly from 10 to 10,000,000 records
 */
const counterSchema = new mongoose.Schema({
  _id: {
    type: String,       // e.g. 'patient', 'staff', 'doctor'
    required: true,
  },
  seq: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('Counter', counterSchema);
