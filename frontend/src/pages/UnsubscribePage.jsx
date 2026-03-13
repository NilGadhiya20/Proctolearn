import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';

const UnsubscribePage = () => {
  const [email, setEmail] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('email') || '';
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [unsubscribed, setUnsubscribed] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleUnsubscribe = async (e) => {
    e.preventDefault();

    if (!email) {
      setStatus({ type: 'error', message: 'Please enter your email address' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus({ type: 'error', message: 'Please enter a valid email address' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await axios.post(`${API_URL}/subscriptions/unsubscribe`, {
        email
      });

      if (response.data.success) {
        setUnsubscribed(true);
        setStatus({
          type: 'success',
          message: 'You have been successfully unsubscribed. We\'ll miss you!'
        });
      }
    } catch (error) {
      console.error('Unsubscribe error:', error);
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Failed to unsubscribe. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResubscribe = async (e) => {
    e.preventDefault();

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await axios.post(`${API_URL}/subscriptions/subscribe`, {
        email,
        source: 'resubscribe'
      });

      if (response.data.success) {
        setUnsubscribed(false);
        setStatus({
          type: 'success',
          message: 'Welcome back! You\'ve been resubscribed successfully.'
        });
      }
    } catch (error) {
      console.error('Resubscribe error:', error);
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Failed to resubscribe. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Proctolearn</h1>
          </div>
          <a href="/" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            Back to Home
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {!unsubscribed ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <div className="text-center mb-8">
                <div className="inline-block p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-4">
                  <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  We're Sorry to See You Go
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Are you sure you want to unsubscribe from our mailing list?
                </p>
              </div>

              {/* Confirmation Message */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
                <p className="text-blue-800 dark:text-blue-300 text-sm">
                  <strong>Before you go:</strong> By unsubscribing, you won't receive any promotional or informational emails from Proctolearn. However, you may still receive important account notifications if you have an active account.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleUnsubscribe} className="space-y-4 mb-8">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    disabled={loading}
                    required
                  />
                </div>

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
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
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

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Yes, Unsubscribe'
                    )}
                  </button>
                  <a
                    href="/"
                    className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors text-center"
                  >
                    Cancel
                  </a>
                </div>
              </form>

              {/* Reasons Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Tell us why you're leaving:
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="reason" value="too-many-emails" className="w-4 h-4" />
                    <span className="text-gray-600 dark:text-gray-400">Receiving too many emails</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="reason" value="not-relevant" className="w-4 h-4" />
                    <span className="text-gray-600 dark:text-gray-400">Content not relevant to me</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="reason" value="other" className="w-4 h-4" />
                    <span className="text-gray-600 dark:text-gray-400">Other reason</span>
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
              <div className="inline-block p-4 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Unsubscribed Successfully
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
                You have been removed from our mailing list. Your preferences have been updated and you won't receive any promotional emails from us.
              </p>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-8">
                <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                  <strong>Note:</strong> If you have an active account, you may still receive important account-related notifications and security alerts.
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleResubscribe}
                  disabled={loading}
                  className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Change Your Mind? Resubscribe'
                  )}
                </button>
                <a href="/" className="block bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors text-center">
                  Back to Home
                </a>
              </div>

              <p className="text-gray-600 dark:text-gray-400 text-sm mt-6">
                We hope to see you again soon! If you have any feedback, please contact us at{' '}
                <a href="mailto:support@proctolearn.com" className="text-purple-600 dark:text-purple-400 hover:underline">
                  support@proctolearn.com
                </a>
              </p>
            </div>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-gray-300 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p>&copy; 2026 Proctolearn. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UnsubscribePage;
