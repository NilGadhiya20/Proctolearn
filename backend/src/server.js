import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/database.js';
import { globalErrorHandler } from './utils/errorHandler.js';
import { verifyEmailConfig, startEmailQueueProcessor } from './utils/emailService.js';
import authRoutes from './routes/authRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import userRoutes from './routes/userRoutes.js';
import institutionRoutes from './routes/institutionRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import { initSocket } from './sockets/quizSocket.js';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

// Verify critical env variables are loaded
if (!process.env.JWT_SECRET) {
  console.error('❌ CRITICAL: JWT_SECRET is not set in .env file');
  process.exit(1);
}
if (!process.env.REFRESH_TOKEN_SECRET) {
  console.error('❌ CRITICAL: REFRESH_TOKEN_SECRET is not set in .env file');
  process.exit(1);
}
console.log('✅ Environment variables loaded successfully');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:3001',
      'http://localhost:3002',
      process.env.FRONTEND_URL || ''
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Initialize Socket.IO
const io = initSocket(server);
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error Handler
app.use(globalErrorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    // Connect to MongoDB before accepting requests to avoid buffered timeouts
    await connectDB();

    // Verify email configuration
    await verifyEmailConfig();
// Start email queue processor (checks every 60 seconds for scheduled emails)
    startEmailQueueProcessor(60000);

    server.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║   🎓 Proctolearn Server Started        ║
║   📍 http://localhost:${PORT}           ║
║   🔗 WebSocket: ws://localhost:${PORT}  ║
║   📧 Email Queue: Initialized          ║
║   🔗 WebSocket: ws://localhost:${PORT}  ║
╚════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
