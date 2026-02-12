# Proctolearn Backend Setup Guide

## Installation

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Express middleware
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── sockets/          # WebSocket handlers
│   ├── utils/            # Utility functions
│   └── server.js         # Main server file
├── .env.example          # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## API Documentation

### Authentication Endpoints
- POST `/api/auth/register` - Register user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user
- POST `/api/auth/refresh-token` - Refresh token

### Quiz Endpoints
- POST `/api/quizzes` - Create quiz
- GET `/api/quizzes` - Get all quizzes
- GET `/api/quizzes/:id` - Get quiz by ID
- PUT `/api/quizzes/:id` - Update quiz
- DELETE `/api/quizzes/:id` - Delete quiz
- POST `/api/quizzes/:id/publish` - Publish quiz

## Database Setup

### MongoDB Local Setup
```bash
# Install MongoDB Community Edition
# https://docs.mongodb.com/manual/installation/

# Start MongoDB service
# macOS: brew services start mongodb-community
# Windows: net start MongoDB
# Linux: sudo systemctl start mongod
```

### MongoDB Atlas (Cloud)
1. Create account on https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Add to `.env` as MONGODB_URI

## WebSocket Connection

The server uses Socket.io for real-time communication. Client connects to:
```
ws://localhost:5000
```

## Testing

```bash
npm test
```

## Linting

```bash
npm run lint
```

## Common Issues

### MongoDB Connection Failed
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Verify network connectivity

### Port Already in Use
- Change PORT in .env
- Or kill process: `lsof -ti:5000 | xargs kill -9`

### JWT Token Errors
- Ensure JWT_SECRET is set in .env
- Check token format (Bearer <token>)

## Support

For issues and questions, create an issue on GitHub.
