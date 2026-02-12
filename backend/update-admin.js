import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import bcryptjs from 'bcryptjs';

dotenv.config();

const updateAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash('Admin@123456', salt);

    // Update existing user
    const admin = await User.findOneAndUpdate(
      { email: 'admin@proctolearn.com' },
      {
        firstName: 'Admin',
        lastName: 'Proctolearn',
        password: hashedPassword,
        role: 'admin',
        adminCode: 'NIL-PROCTO2912',
        isEmailVerified: true,
        isActive: true
      },
      { new: true }
    );

    if (!admin) {
      console.error('❌ Admin user not found');
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log('✅ Admin user updated successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email: admin@proctolearn.com');
    console.log('🔐 Password: Admin@123456');
    console.log('🔑 Admin Code: NIL-PROCTO2912');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Ready to login!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

updateAdmin();
