const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding...');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@clinic.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    
    // Check if any admin exists
    const existingAdmins = await Admin.find({});
    
    if (existingAdmins.length > 0) {
      console.log('Existing admin found -> Updating by removing old admins...');
      await Admin.deleteMany({});
    } else {
      console.log('No existing admin found -> Creating new admin...');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    await Admin.create({
      name: 'System Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
    });

    console.log('Admin seeded successfully.');
    console.log(`Email: ${adminEmail} | Password: [HIDDEN]`);

    process.exit(0);
  } catch (error) {
    console.error(`Error seeding data: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
