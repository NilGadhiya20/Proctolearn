# Proctolearn Frontend Setup Guide

## Installation

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure API and Socket URLs in `.env`

## Running the Application

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Build
```bash
npm run preview
```

## Project Structure

```
frontend/
├── public/               # Static assets
├── src/
│   ├── components/       # React components
│   ├── context/          # Zustand stores
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   ├── services/         # API and Socket services
│   ├── styles/           # CSS styles
│   ├── utils/            # Utility functions
│   ├── App.jsx           # Main App component
│   └── main.jsx          # Entry point
├── index.html            # HTML template
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind CSS config
├── postcss.config.js     # PostCSS configuration
└── package.json
```

## Key Features

### Pages
- **Login** - User authentication
- **CreateQuiz** - Quiz creation interface
- **QuizAttempt** - Quiz taking interface
- **Dashboard** - User dashboard

### Components
- **ProtectedRoute** - Role-based access control
- **QuizMonitoring** - Activity tracking
- **ActivityAlert** - Alert display

### Services
- **authService** - Authentication API calls
- **quizService** - Quiz API calls
- **socketService** - WebSocket communication

### Hooks
- **useAuth** - Authentication state
- **useQuizMonitoring** - Activity monitoring

## Environment Variables

```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Required Permissions

The application requires these browser permissions:
- Fullscreen API
- Page Visibility API
- Local Storage

## Performance Optimization

- Code splitting with Vite
- Lazy loading of routes
- Image optimization
- Minification and bundling

## Deployment

### Vercel
```bash
npm run build
# Deploy dist folder to Vercel
```

### Netlify
```bash
npm run build
# Connect GitHub repo to Netlify
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## Troubleshooting

### Build Errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`

### API Connection Issues
- Check backend is running
- Verify VITE_API_URL in .env
- Check CORS configuration

### Socket Connection Failed
- Ensure backend WebSocket is active
- Verify VITE_SOCKET_URL
- Check firewall settings

## Support

For issues and questions, create an issue on GitHub.
