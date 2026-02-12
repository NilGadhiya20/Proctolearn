import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Institution from './src/models/Institution.js';

dotenv.config();

const addInstitution = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const existing = await Institution.findOne({ code: 'PPSU' });
    
    if (existing) {
      console.log('⚠️ Institution with code PPSU already exists');
      await mongoose.disconnect();
      process.exit(0);
    }

    const institution = await Institution.create({
      name: 'P P SAVANI UNIVERSITY',
      code: 'PPSU',
      email: 'admin@ppsu.ac.in',
      phone: '+91-261-2777000',
      address: 'Kosamba',
      city: 'Surat',
      state: 'Gujarat',
      country: 'India',
      postalCode: '394125',
      website: 'https://ppsu.ac.in',
      isActive: true
    });

    console.log('✅ Institution created successfully:');
    console.log(JSON.stringify(institution, null, 2));

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

addInstitution();
