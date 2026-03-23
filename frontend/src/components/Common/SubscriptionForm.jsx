import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Check, AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SubscriptionForm = ({ variant = 'default', className = '' }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setStatus({ type: 'error', message: 'Please enter your email address' });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus({ type: 'error', message: 'Please enter a valid email address' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await axios.post(`${API_URL}/subscriptions/subscribe`, {
        email,
        name,
        source: 'website'
      });

      if (response.data.success) {
        setStatus({
          type: 'success',
          message: response.data.message || 'Thank you for subscribing! Please check your email.'
        });
        setEmail('');
        setName('');
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setStatus({ type: '', message: '' });
        }, 5000);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      if (error.response?.data?.requiresAccount) {
        setStatus({
          type: 'error',
          message: 'To subscribe, you need an account. Redirecting to sign up...'
        });
        setTimeout(() => {
          navigate(`/register?email=${encodeURIComponent(email.trim().toLowerCase())}&from=subscription`);
        }, 1500);
        return;
      }

      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Failed to subscribe. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Variant styles
  const variants = {
    default: {
      container: 'bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8',
      title: 'text-2xl font-bold text-gray-900 dark:text-white mb-2',
      description: 'text-gray-600 dark:text-gray-400 mb-6',
      input: 'w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent',
      button: 'w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105'
    },
    minimal: {
      container: 'bg-transparent p-4',
      title: 'text-xl font-semibold text-gray-900 dark:text-white mb-2',
      description: 'text-gray-600 dark:text-gray-400 mb-4 text-sm',
      input: 'w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm',
      button: 'w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors'
    },
    inline: {
      container: 'bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6',
      title: 'text-lg font-bold text-gray-900 dark:text-white mb-1',
      description: 'text-gray-600 dark:text-gray-400 mb-4 text-sm',
      input: 'flex-1 px-4 py-2 rounded-l-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white',
      button: 'bg-purple-600 text-white py-2 px-6 rounded-r-lg font-medium hover:bg-purple-700 transition-colors'
    }
  };

  const style = variants[variant] || variants.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`${style.container} ${className}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
          <Mail className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h3 className={style.title}>
            {variant === 'minimal' ? 'Stay Updated' : 'Subscribe to Our Newsletter'}
          </h3>
          <p className={style.description}>
            Get the latest updates, quiz announcements, and educational tips delivered to your inbox.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubscribe} className="space-y-4">
        {variant !== 'inline' ? (
          <>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name (Optional)
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className={style.input}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={style.input}
                disabled={loading}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`${style.button} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Subscribing...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  Subscribe Now
                </>
              )}
            </button>
          </>
        ) : (
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className={style.input}
              disabled={loading}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className={`${style.button} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap`}
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                'Subscribe'
              )}
            </button>
          </div>
        )}

        {/* Status Messages */}
        {status.message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg flex items-start gap-3 ${
              status.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}
          >
            {status.type === 'success' ? (
              <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <p
              className={`text-sm ${
                status.type === 'success'
                  ? 'text-green-800 dark:text-green-300'
                  : 'text-red-800 dark:text-red-300'
              }`}
            >
              {status.message}
            </p>
          </motion.div>
        )}
      </form>

      {variant !== 'minimal' && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4 text-green-500" />
              No spam
            </span>
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4 text-green-500" />
              Unsubscribe anytime
            </span>
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4 text-green-500" />
              Weekly updates
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SubscriptionForm;
