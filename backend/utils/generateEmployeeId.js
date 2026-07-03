const User = require('../models/User');

const ROLE_MAPPINGS = {
  'doctor': 'DOC',
  'receptionist': 'REC',
  'nurse': 'NUR',
  'lab staff': 'LAB',
  'accountant': 'ACC',
  'pharmacist': 'PHA',
  'admin staff': 'ADM',
  'cleaner': 'CLN',
  'security': 'SEC'
};

const getRoleCode = (role) => {
  if (!role) return 'EMP'; // Fallback
  
  const roleLower = role.toLowerCase().trim();
  if (ROLE_MAPPINGS[roleLower]) {
    return ROLE_MAPPINGS[roleLower];
  }
  
  // If not found in mapping, generate a 3-letter code
  // Convert to uppercase, remove spaces and special chars, take first 3 letters
  const code = role.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 3);
  
  // If code is somehow shorter than 3 after stripping, pad it with X
  return code.padEnd(3, 'X');
};

const generateEmployeeId = async (role) => {
  const roleCode = getRoleCode(role);
  const prefix = `OD-${roleCode}-`;
  
  // Find the highest Employee ID for this role code
  // using a regex to match the exact prefix, sorting descending
  const highestUser = await User.findOne({ 
    employeeId: { $regex: `^${prefix}` } 
  }).sort({ employeeId: -1 });
  
  let nextNumber = 1;
  
  if (highestUser && highestUser.employeeId) {
    // Extract the numeric portion
    // e.g. "OD-DOC-0004" -> "0004"
    const currentNumberStr = highestUser.employeeId.split('-')[2];
    if (currentNumberStr) {
      const currentNumber = parseInt(currentNumberStr, 10);
      if (!isNaN(currentNumber)) {
        nextNumber = currentNumber + 1;
      }
    }
  }
  
  // Pad the number to at least 4 digits
  // if nextNumber > 9999, toString().padStart won't truncate it, which is correct
  const paddedNumber = nextNumber.toString().padStart(4, '0');
  
  return `${prefix}${paddedNumber}`;
};

module.exports = {
  getRoleCode,
  generateEmployeeId
};
