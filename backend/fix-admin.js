import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const fixAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Update the user to be admin with correct code
    const admin = await User.findOneAndUpdate(
      { email: 'admin@proctolearn.com' },
      {
        role: 'admin',
        adminCode: 'NIL-PROCTO2912'
      },
      { new: true }
    );

    if (!admin) {
      console.log('❌ Admin user not found');
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log('✅ Admin user updated successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email: admin@proctolearn.com');
    console.log('🔐 Password: Admin@123456');
    console.log('🔑 Admin Code: NIL-PROCTO2912');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

fixAdmin();
