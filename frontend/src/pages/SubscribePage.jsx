import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import SubscriptionForm from '../components/Common/SubscriptionForm';

const SubscribePage = () => {
  const [showForm, setShowForm] = useState(true);

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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Stay Updated with Proctolearn
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Subscribe to our newsletter and be the first to know about new quizzes, platform updates, and exclusive educational content.
            </p>

            {/* Benefits List */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Quiz Announcements</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Get instant notifications when new quizzes are available</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">System Updates</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Learn about important platform improvements and new features</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Educational Content</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Access exclusive tips, guides, and study materials</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Early Access</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Be among the first to try new features and beta programs</p>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">We Respect Your Privacy</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    We never share your email and you can unsubscribe anytime. Your information is completely safe with us.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Subscription Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <SubscriptionForm variant="default" />
          </motion.div>
        </div>

        {/* Additional Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">10K+</div>
            <p className="text-gray-600 dark:text-gray-400">Active Subscribers</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">100%</div>
            <p className="text-gray-600 dark:text-gray-400">Spam-Free Promise</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
            <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">24/7</div>
            <p className="text-gray-600 dark:text-gray-400">Support Team Ready</p>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-20"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Frequently Asked Questions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                How often will I receive emails?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                We send updates about quiz announcements, system improvements, and our weekly newsletter. You'll typically receive 2-3 emails per week.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Can I unsubscribe anytime?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Yes! You can unsubscribe at any time by clicking the unsubscribe button in any email we send you.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                What data do you collect?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                We only collect your email address and name (optional). We never share your information with third parties.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Do I need an account to subscribe?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Yes. You need a Proctolearn account to subscribe. If your email is not registered, you will be redirected to sign up.
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-gray-300 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p>&copy; 2026 Proctolearn. All rights reserved.</p>
            <p className="text-sm text-gray-500 mt-2">
              <a href="#" className="hover:text-gray-300 mr-4">Privacy Policy</a>
              <a href="#" className="hover:text-gray-300 mr-4">Terms of Service</a>
              <a href="mailto:support@proctolearn.com" className="hover:text-gray-300">Contact Support</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SubscribePage;
