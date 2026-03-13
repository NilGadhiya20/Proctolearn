import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Quiz from './src/models/Quiz.js';

dotenv.config();

const listQuizzes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all quizzes
    const quizzes = await Quiz.find({}).select('_id title status createdBy institution');
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📚 All Quizzes (${quizzes.length}):`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (quizzes.length === 0) {
      console.log('❌ No quizzes found in database');
    } else {
      quizzes.forEach((q, i) => {
        console.log(`${i + 1}. ${q.title || 'Untitled'}`);
        console.log(`   ID: ${q._id}`);
        console.log(`   Status: ${q.status}`);
        console.log(`   Created By: ${q.createdBy}`);
        console.log(`   Institution: ${q.institution}`);
        console.log('');
      });
    }

    // Find published quizzes specifically
    const publishedQuizzes = await Quiz.find({ status: 'published' });
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📗 Published Quizzes (${publishedQuizzes.length}):`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (publishedQuizzes.length === 0) {
      console.log('❌ No published quizzes found');
    } else {
      publishedQuizzes.forEach((q, i) => {
        console.log(`${i + 1}. ${q.title}`);
        console.log(`   ID: ${q._id}`);
        console.log(`   ID Type: ${typeof q._id}`);
        console.log(`   ID Valid: ${mongoose.Types.ObjectId.isValid(q._id)}`);
        console.log('');
      });
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

listQuizzes();
