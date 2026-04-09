import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Ensure environment variables are loaded
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const sanitizeMongoUri = (uri = '') => {
  if (!uri) return 'not-set';
  return uri.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:***@');
};

const isTruthy = (value) => ['1', 'true', 'yes', 'on'].includes(String(value || '').toLowerCase());

const buildConnectionOptions = () => ({
  serverSelectionTimeoutMS: Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || 8000),
  socketTimeoutMS: Number(process.env.MONGODB_SOCKET_TIMEOUT_MS || 45000),
  family: 4, // Use IPv4, skip trying IPv6
  retryWrites: true,
  w: 'majority'
});

const tryConnect = async (uri, label) => {
  if (!uri) {
    throw new Error(`${label} URI is empty`);
  }

  await mongoose.connect(uri, buildConnectionOptions());
  console.log(`✅ MongoDB connected successfully (${label})`);
  console.log(`📦 Database: ${mongoose.connection.name}`);
  console.log(`🌐 Host: ${mongoose.connection.host}`);
  return mongoose.connection;
};

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI;
  const fallbackUri = process.env.MONGODB_URI_FALLBACK || 'mongodb://127.0.0.1:27017/proctolearn';
  const allowFallback = process.env.NODE_ENV !== 'production' && !isTruthy(process.env.DISABLE_DB_FALLBACK);

  if (!primaryUri) {
    console.error('❌ MONGODB_URI is not set in environment variables');
    console.error('💡 Add MONGODB_URI to backend/.env (Atlas or local URI).');

    if (allowFallback) {
      console.warn(`⚠️ Attempting local fallback DB: ${sanitizeMongoUri(fallbackUri)}`);
      return tryConnect(fallbackUri, 'local-fallback');
    }

    throw new Error('MONGODB_URI is required');
  }

  try {
    return await tryConnect(primaryUri, 'primary');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error(`🔎 Primary URI: ${sanitizeMongoUri(primaryUri)}`);

    if (allowFallback) {
      try {
        console.warn('↪️ Atlas unreachable or blocked; trying local MongoDB fallback...');
        console.warn(`🔎 Fallback URI: ${sanitizeMongoUri(fallbackUri)}`);
        return await tryConnect(fallbackUri, 'local-fallback');
      } catch (fallbackError) {
        console.error('❌ Local fallback MongoDB connection failed:', fallbackError.message);
      }
    }

    console.error('💡 Tips:');
    console.error('   1. Check if your IP is whitelisted in MongoDB Atlas');
    console.error('   2. Verify your internet connection');
    console.error('   3. Check if MongoDB cluster is active');
    console.error('   4. Start local MongoDB and set MONGODB_URI_FALLBACK if needed');
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error disconnecting MongoDB:', error);
  }
};

export { connectDB, disconnectDB };
