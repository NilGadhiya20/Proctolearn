import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import AppWorking from './AppWorking';
import './styles/index.css';
import './styles/scrollAnimations.css';

// Add error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', fontFamily: 'Arial' }}>
          <h1>Something went wrong!</h1>
          <pre>{this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

console.log('main.jsx loaded');

const root = document.getElementById('root');
console.log('Root element:', root);

if (!root) {
  document.body.innerHTML = '<div style="padding: 20px; color: red; font-family: Arial;"><h1>ERROR: Root not found</h1></div>';
} else {
  try {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <ErrorBoundary>
          <AppWorking />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#ffffff',
                color: '#1e293b',
                padding: '16px',
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                fontSize: '14px',
                fontWeight: '500',
                maxWidth: '400px',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#f0fdf4',
                  color: '#15803d',
                  border: '1px solid #86efac',
                },
                iconTheme: {
                  primary: '#16a34a',
                  secondary: '#f0fdf4',
                },
              },
              error: {
                duration: 4000,
                style: {
                  background: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fca5a5',
                },
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fef2f2',
                },
              },
              loading: {
                style: {
                  background: '#eff6ff',
                  color: '#1e40af',
                  border: '1px solid #93c5fd',
                },
              },
            }}
          />
        </ErrorBoundary>
      </React.StrictMode>
    );
    console.log('✅ App rendered');
  } catch (e) {
    console.error('Render error:', e);
    root.innerHTML = `<div style="padding:20px;color:red;font-family:Arial"><h1>Error: ${e.message}</h1><pre>${e.stack}</pre></div>`;
  }
}
