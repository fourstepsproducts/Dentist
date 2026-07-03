const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const users = await User.find({ email: { $in: ['doc1@clinic.com', 'nurse1@clinic.com', 'den1@clinic.com'] } });
  console.log(users.map(u => ({ email: u.email, employeeId: u.employeeId })));
  
  // Clean up
  await User.deleteMany({ email: { $in: ['doc1@clinic.com', 'nurse1@clinic.com', 'den1@clinic.com'] } });
  process.exit(0);
});
