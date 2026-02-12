# Proctolearn - Professional Quiz Proctoring Platform

A comprehensive, production-grade quiz platform with real-time proctoring, activity monitoring, and role-based access control for educational institutions.

## 🎯 Features

### For Students
- **Professional OTP-based Login** - Secure phone verification (+91 format)
- Register and login with institutional credentials
- Browse available quizzes
- Attempt quizzes with restricted mode
- Real-time submission tracking
- View results and feedback

### For Faculty
- Create and manage quizzes
- Configure proctoring settings
- Monitor student activity in real-time
- Receive alerts for suspicious behavior
- View participation reports
- Grade and provide feedback

### For Administrators
- **Multi-Tab Admin Login** - Secure email + password authentication
- Manage users across institution
- Manage institutions (multi-tenancy)
- View system-wide analytics
- Configure platform settings
- Access detailed activity logs

### For Engineers/Field Staff
- **Engineer Login Tab** - ID + passcode authentication

### System Capabilities
- **Real-time Activity Monitoring**: Tab switching, fullscreen exit, copy-paste attempts
- **Assessment Integrity**: Fullscreen enforcement, tab restriction, keyboard shortcut detection
- **Live Dashboard**: Faculty can monitor student activities during quiz
- **Suspicious Activity Detection**: AI-based anomaly detection with suspicion scoring
- **Email Alerts**: Instant notifications for suspicious behavior
- **Detailed Reporting**: Comprehensive activity logs and analytics

## 🏗️ Architecture

### Frontend (React + Vite)
- **UI Framework**: Material-UI 5.14.0 + Tailwind CSS
- **State Management**: Zustand
- **Real-time Communication**: Socket.io-client
- **HTTP Client**: Axios
- **Animations**: Framer Motion 10.16.0
- **Authentication**: Social Login (Google), OTP verification, Multi-tab system
- **Responsive Design**: Full mobile-first with custom hooks and utilities
- **Monitoring**: Page Visibility API, Fullscreen API

### Backend (Node.js + Express)
- **Server Framework**: Express.js
- **Real-time Communication**: Socket.io
- **Authentication**: JWT (JSON Web Token)
- **Database**: MongoDB + Mongoose ORM
- **Email Service**: Nodemailer
- **Middleware**: CORS, Helmet, Morgan

### Database (MongoDB)
- **Models**: User, Institution, Quiz, Question, StudentSubmission, ActivityLog
- **Indexing**: Optimized for fast queries
- **TTL Indexes**: Auto-cleanup of activity logs

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16.x
- MongoDB >= 4.4
- npm or yarn

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure your environment variables
# - MongoDB URI
# - JWT Secret
# - SMTP credentials
# - Frontend URL

# Start development server
npm run dev

# Server runs on http://localhost:5000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure API URL and Socket URL
# VITE_API_URL=http://localhost:5000/api
# VITE_SOCKET_URL=http://localhost:5000

# Start development server
npm run dev

# Application runs on http://localhost:3000
```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login with email/password
- `POST /api/auth/send-otp` - Send OTP for phone verification
- `POST /api/auth/verify-otp` - Verify OTP and authenticate
- `POST /api/auth/google-login` - Social login via Google
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Quizzes
- `POST /api/quizzes` - Create quiz (Faculty/Admin)
- `GET /api/quizzes` - List quizzes
- `GET /api/quizzes/:id` - Get quiz details
- `PUT /api/quizzes/:id` - Update quiz (Faculty/Admin)
- `DELETE /api/quizzes/:id` - Delete quiz (Faculty/Admin)
- `POST /api/quizzes/:id/publish` - Publish quiz (Faculty/Admin)
- `POST /api/quizzes/:id/assign-students` - Assign students (Faculty/Admin)

## 🔌 WebSocket Events

### Client → Server
- `join-quiz` - Student joins quiz
- `activity` - Log user activity
- `visibility-change` - Page visibility change
- `submit-quiz` - Submit quiz

### Server → Client
- `activity-logged` - Activity logged confirmation
- `alert` - Suspicious activity alert
- `submission-complete` - Submission successful
- `error` - Error message

## 📊 Activity Types Monitored

- `tab_change` - Tab/window switching
- `fullscreen_exit` - Exiting fullscreen mode
- `fullscreen_enter` - Entering fullscreen mode
- `copy_attempt` - Copy command (Ctrl+C)
- `paste_attempt` - Paste command (Ctrl+V)
- `right_click` - Right-click attempt
- `keyboard_shortcut` - Suspicious shortcuts
- `window_blur` - Focus lost
- `page_visibility_change` - Page hidden/shown

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcryptjs for secure password storage
- **CORS Protection**: Cross-origin request validation
- **Helmet.js**: HTTP headers security
- **Input Validation**: Express-validator for data validation
- **Rate Limiting**: Prevent brute-force attacks
- **HTTPS Ready**: Production-grade SSL/TLS support

## 📊 Suspicion Scoring

The system calculates a suspicion score (0-100) based on:
- Tab switching (20 points max)
- Fullscreen exits (25 points each)
- Copy-paste attempts (15 points max)
- Window blur events (10 points max)
- Right-click attempts (10 points max)
- Keyboard shortcuts (10 points max)

Score ranges:
- 0-24: Low severity
- 25-49: Medium severity
- 50-74: High severity
- 75-100: Critical severity

## 🗄️ Database Schema

### Users
- Personal information
- Authentication credentials
- Institution association
- Email verification status
- Activity preferences

### Quizzes
- Quiz content and metadata
- Proctoring settings
- Access window configuration
- Assignment tracking

### Student Submissions
- Quiz attempt tracking
- Answer storage
- Real-time status
- Suspicion metrics

### Activity Logs
- Detailed event logging
- Timestamp and severity
- Anomaly detection results
- Faculty acknowledgment tracking

## 🚀 Deployment

### Production Checklist
- [ ] Set up MongoDB Atlas (or self-hosted MongoDB)
- [ ] Configure environment variables
- [ ] Enable HTTPS
- [ ] Setup email service (SMTP)
- [ ] Configure CORS for production URLs
- [ ] Enable rate limiting
- [ ] Setup error logging (Sentry, etc.)
- [ ] Configure CDN for static assets
- [ ] Setup backup strategy
- [ ] Enable monitoring and alerts

### Docker Deployment
```bash
# Build Docker images
docker-compose build

# Run containers
docker-compose up -d
```

## 📝 Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=production
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASSWORD=your_password
FRONTEND_URL=https://proctolearn.com
```

### Frontend (.env)
```
VITE_API_URL=https://api.proctolearn.com
VITE_SOCKET_URL=https://api.proctolearn.com
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support, email support@proctolearn.com or open an issue in the repository.

## 📞 Contact

- **Email**: info@proctolearn.com
- **Website**: https://proctolearn.com
- **Documentation**: https://docs.proctolearn.com

---

**Proctolearn** - Making education secure and integrity-driven
