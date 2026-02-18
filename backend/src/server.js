import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import { globalErrorHandler } from './utils/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import userRoutes from './routes/userRoutes.js';
import institutionRoutes from './routes/institutionRoutes.js';
import { initSocket } from './sockets/quizSocket.js';

dotenv.config();

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
app.use('/api/auth', userRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/institutions', institutionRoutes);

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
    // Connect to MongoDB (non-blocking)
    connectDB().catch(err => {
      console.warn('⚠️ MongoDB connection failed, but server will continue:', err.message);
    });

    server.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║   🎓 Proctolearn Server Started        ║
║   📍 http://localhost:${PORT}           ║
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
