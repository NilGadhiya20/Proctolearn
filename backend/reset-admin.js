import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import bcryptjs from 'bcryptjs';

dotenv.config();

const resetAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete any broken admin records
    await User.deleteMany({ adminCode: 'NIL-PROCTO2912' });
    console.log('✅ Cleaned up old admin records');

    // Get institution
    const Institution = (await import('./src/models/Institution.js')).default;
    const institution = await Institution.findOne({ code: 'PPSU' });

    if (!institution) {
      console.error('❌ Institution PPSU not found');
      await mongoose.disconnect();
      process.exit(1);
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash('Admin@123456', salt);

    // Create clean admin user
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

    await mongoose.disconnect();
    console.log('✅ Ready to login!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

resetAdmin();
