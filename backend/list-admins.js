import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const listAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all admins
    const admins = await User.find({ role: 'admin' }).select('+password adminCode');
    
    if (admins.length === 0) {
      console.log('❌ No admin users found');
    } else {
      console.log(`✅ Found ${admins.length} admin user(s):`);
      admins.forEach((a, i) => {
        console.log(`\n${i + 1}. ${a.firstName} ${a.lastName}`);
        console.log(`   Email: ${a.email}`);
        console.log(`   Admin Code: ${a.adminCode}`);
      });
    }

    // Also find the user we created
    const proctoAdm = await User.findOne({ email: 'admin@proctolearn.com' });
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (proctoAdm) {
      console.log('Admin@proctolearn.com exists:');
      console.log('Role:', proctoAdm.role);
      console.log('Admin Code:', proctoAdm.adminCode);
    } else {
      console.log('admin@proctolearn.com does NOT exist');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

listAdmins();
