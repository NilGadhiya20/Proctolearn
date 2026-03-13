import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

// Suppress mongoose warnings
mongoose.set('strictQuery', false);

const fixFacultyRole = async () => {
  try {
    // Connect with optimized options - no unnecessary output
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Fail fast if can't connect
      socketTimeoutMS: 10000,
    });

    // Fix faculty@proctolearn.com to ensure it's faculty
    const result = await User.findOneAndUpdate(
      { email: 'faculty@proctolearn.com' },
      { role: 'faculty' },
      { new: true }
    );

    if (result) {
      console.log('✅ Faculty role updated successfully');
      console.log(`${result.firstName} ${result.lastName} (${result.email}) - Role: ${result.role}`);
    } else {
      console.log('❌ Faculty user not found');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

fixFacultyRole();
