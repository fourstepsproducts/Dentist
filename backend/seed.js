const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
const User = require('./models/User');
const Role = require('./models/Role');
const Specialization = require('./models/Specialization');

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

    // Seed default roles if they don't exist
    const defaultRoles = [
      { name: 'Doctor', description: 'Handles clinical diagnoses and dental procedures.' },
      { name: 'Receptionist', description: 'Manages patient appointments, inquiries, and front desk operations.' },
      { name: 'Nurse', description: 'Assists doctors during operations and provides basic care.' },
      { name: 'Lab Staff', description: 'Performs laboratory tests, analyzes samples, and reports results.' },
      { name: 'Accountant', description: 'Manages financial records, budgets, salaries, and invoices.' },
      { name: 'Pharmacist', description: 'Dispenses medications and advises patients on their usage.' },
      { name: 'Admin Staff', description: 'Coordinates administrative, facilities, and support services.' },
      { name: 'Cleaner', description: 'Maintains cleanliness and sanitation across the clinic.' },
      { name: 'Security', description: 'Secures clinic premises and monitors access control.' }
    ];

    for (const r of defaultRoles) {
      const exists = await Role.findOne({ name: r.name });
      if (!exists) {
        await Role.create(r);
        console.log(`Role seeded: ${r.name}`);
      }
    }

    // Seed default specializations if they don't exist
    const defaultSpecs = [
      'General Dentistry',
      'Orthodontics',
      'Endodontics',
      'Periodontics',
      'Prosthodontics',
      'Oral & Maxillofacial Surgery',
      'Pediatric Dentistry'
    ];

    for (const specName of defaultSpecs) {
      const exists = await Specialization.findOne({ name: specName });
      if (!exists) {
        await Specialization.create({ name: specName });
        console.log(`Specialization seeded: ${specName}`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error(`Error seeding data: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();

