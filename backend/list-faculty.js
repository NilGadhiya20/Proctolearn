import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const listFaculty = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all faculty users
    const faculty = await User.find({ role: 'faculty' });
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (faculty.length === 0) {
      console.log('❌ No faculty users found');
    } else {
      console.log(`✅ Found ${faculty.length} faculty user(s):`);
      faculty.forEach((f, i) => {
        console.log(`\n${i + 1}. ${f.firstName} ${f.lastName}`);
        console.log(`   Email: ${f.email}`);
        console.log(`   Role: ${f.role}`);
        console.log(`   Institution: ${f.institution}`);
      });
    }

    // Find all users that have "faculty" in their email
    const facultyEmails = await User.find({ email: /faculty/i });
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Users with "faculty" in email:');
    if (facultyEmails.length === 0) {
      console.log('None found');
    } else {
      facultyEmails.forEach((u, i) => {
        console.log(`\n${i + 1}. ${u.firstName} ${u.lastName}`);
        console.log(`   Email: ${u.email}`);
        console.log(`   Actual Role: ${u.role}`);
      });
    }

    // Find all users to see complete list
    const allUsers = await User.find({}).select('email firstName lastName role');
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 All Users (${allUsers.length}):`);
    allUsers.forEach((u, i) => {
      console.log(`${i + 1}. ${u.email} - Role: ${u.role}`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

listFaculty();
