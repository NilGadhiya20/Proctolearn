import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Mail, Send, MapPin, Phone, Twitter, Facebook, Linkedin, Heart, Shield } from 'lucide-react';
import { useAuthStore } from '../../context/store';
import api from '../../services/api';

const FacultyFooter = () => {
  const { user } = useAuthStore();
  const [email, setEmail] = useState(user?.email || '');
  const [subscribing, setSubscribing] = useState(false);
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);
  const [preferences, setPreferences] = useState({
    quizUpdates: true,
    systemUpdates: true,
    newsletter: true,
    promotions: false
  });

  const currentYear = new Date().getFullYear();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setSubscribing(true);
    try {
      const response = await api.post('/subscriptions/subscribe', {
        email,
        name: user?.firstName || 'Faculty Member',
        preferences: {
          quizUpdates: preferences.quizUpdates,
          systemUpdates: preferences.systemUpdates,
          newsletter: preferences.newsletter,
          promotions: preferences.promotions
        },
        source: 'faculty-dashboard'
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setSubscriptionSuccess(true);
        setTimeout(() => setSubscriptionSuccess(false), 5000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      toast.error(errorMsg);
    } finally {
      setSubscribing(false);
    }
  };

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' }
    }
  };

  return (
    <motion.footer
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, amount: 0.5 }}
      variants={containerVariants}
      className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 py-12 md:py-16 border-t border-slate-700 mt-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">ProctoLearn</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Advanced proctoring platform ensuring academic integrity in online assessments.
            </p>
            <div className="flex gap-3 pt-2">
              {[
                { Icon: Twitter, href: '#' },
                { Icon: Facebook, href: '#' },
                { Icon: Linkedin, href: '#' }
              ].map(({ Icon, href }, idx) => (
                <motion.a
                  key={idx}
                  href={href}
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg bg-slate-700 hover:bg-emerald-600 transition-colors duration-300"
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Features */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h4 className="text-lg font-semibold text-white mb-4">Features</h4>
            <ul className="space-y-2">
              {[
                'Live Proctoring',
                'Quiz Management',
                'Real-time Monitoring',
                'Grade Analytics',
                'Report Generation'
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer">
                  <span className="w-1 h-1 rounded-full bg-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-1 text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer">
                    support@proctolearn.com
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-1 text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">Phone</p>
                  <p className="text-sm text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer">
                    +1 (555) 123-4567
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-1 text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">Address</p>
                  <p className="text-sm text-slate-300">
                    Tech Park, Silicon Valley<br />USA
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Newsletter Subscription */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-emerald-500" />
              <h4 className="text-lg font-semibold text-white">Newsletter</h4>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Get updates about new features, tips, and educational insights.
            </p>

            {subscriptionSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-lg"
              >
                <p className="text-sm text-emerald-300 font-medium flex items-center gap-2">
                  <span className="text-lg">✓</span> Subscribed successfully!
                </p>
                <p className="text-xs text-slate-400 mt-1">Check your email for confirmation.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="relative group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white placeholder-slate-500 border border-slate-600 focus:border-emerald-500 focus:outline-none transition-colors text-sm"
                  />
                  <motion.button
                    type="submit"
                    disabled={subscribing}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {subscribing ? (
                      <span className="w-5 h-4 animate-spin inline-block">⟳</span>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </motion.button>
                </div>

                {/* Preferences */}
                <div className="space-y-2 text-xs">
                  <label className="flex items-center gap-2 text-slate-400 hover:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.quizUpdates}
                      onChange={(e) => setPreferences({ ...preferences, quizUpdates: e.target.checked })}
                      className="w-3 h-3 rounded border-slate-600 accent-emerald-600"
                    />
                    Quiz updates
                  </label>
                  <label className="flex items-center gap-2 text-slate-400 hover:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.systemUpdates}
                      onChange={(e) => setPreferences({ ...preferences, systemUpdates: e.target.checked })}
                      className="w-3 h-3 rounded border-slate-600 accent-emerald-600"
                    />
                    System updates
                  </label>
                  <label className="flex items-center gap-2 text-slate-400 hover:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.newsletter}
                      onChange={(e) => setPreferences({ ...preferences, newsletter: e.target.checked })}
                      className="w-3 h-3 rounded border-slate-600 accent-emerald-600"
                    />
                    Newsletter
                  </label>
                </div>
              </form>
            )}
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.8 }}
          className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-8"
        />

        {/* Bottom Section */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row items-center justify-between gap-4"
        >
          {/* Copyright */}
          <div className="text-center md:text-left text-sm text-slate-400">
            <p className="mb-1">
              &copy; {currentYear} <span className="text-emerald-400 font-semibold">ProctoLearn</span> - Proctored Quiz System. All rights reserved.
            </p>
            <p className="text-xs text-slate-500 flex items-center justify-center md:justify-start gap-1">
              Ensuring academic integrity <span className="text-emerald-500"><Heart className="w-3 h-3 inline" /></span> through advanced technology
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            {[
              { label: 'Privacy Policy', href: '#' },
              { label: 'Terms of Service', href: '#' },
              { label: 'Contact Us', href: '#' },
              { label: 'Documentation', href: '#' }
            ].map((link, idx) => (
              <motion.a
                key={idx}
                href={link.href}
                whileHover={{ color: '#34d399' }}
                className="text-slate-400 hover:text-emerald-400 transition-colors"
              >
                {link.label}
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>All systems operational • Faculty Portal Active</span>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default FacultyFooter;
