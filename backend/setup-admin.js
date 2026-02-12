import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Institution from './src/models/Institution.js';
import bcryptjs from 'bcryptjs';

dotenv.config();

const setupAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get PPSU institution
    const institution = await Institution.findOne({ code: 'PPSU' });
    if (!institution) {
      console.error('❌ Institution PPSU not found. Run setup-ppsu-institution.js first');
      await mongoose.disconnect();
      process.exit(1);
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@proctolearn.com' });
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      await mongoose.disconnect();
      process.exit(0);
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash('Admin@123456', salt);

    // Create admin user
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'Proctolearn',
      email: 'admin@proctolearn.com',
      password: hashedPassword,
      role: 'admin',
      institution: institution._id,
      adminCode: 'NIL-PROCTO2912',
      isEmailVerified: true,
      isActive: true
    });

    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email: admin@proctolearn.com');
    console.log('🔐 Password: Admin@123456');
    console.log('🔑 Admin Code: NIL-PROCTO2912');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  Please change the password after first login!');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

setupAdmin();
