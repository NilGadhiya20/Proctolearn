# Email Subscription System - Integration Examples

This file shows you how to integrate the subscription system into your existing pages.

---

## 1. Add Subscribe Button to Landing Page

### Example 1: Hero Section
```jsx
// In Landing.jsx or any page

import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <motion.section className="py-20 bg-gradient-to-r from-purple-50 to-blue-50">
      <div className="max-w-4xl mx-auto text-center px-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Master Your Quizzes with Proctolearn
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Secure, fair, and intelligent assessment platform
        </p>
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
          >
            Get Started
          </button>
          <button
            onClick={() => navigate('/subscribe')}
            className="px-8 py-3 bg-white text-purple-600 border-2 border-purple-600 rounded-lg font-semibold hover:bg-purple-50 flex items-center gap-2"
          >
            <Mail className="w-5 h-5" />
            Subscribe to Updates
          </button>
        </div>
      </div>
    </motion.section>
  );
}
```

---

## 2. Add Subscribe Form to Footer

### Example 2: Footer Integration
```jsx
// In Footer.jsx or Common Layout

import SubscriptionForm from './SubscriptionForm';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-4">
        
        {/* Newsletter Subscription */}
        <div className="md:col-span-2">
          <h3 className="text-xl font-bold mb-4">Stay Updated</h3>
          <p className="text-gray-400 mb-4">
            Get the latest quiz announcements and platform updates.
          </p>
          <SubscriptionForm variant="inline" />
        </div>

        {/* Other Footer Sections */}
        <div>
          <h4 className="font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="/" className="hover:text-white">Home</a></li>
            <li><a href="/about" className="hover:text-white">About</a></li>
            <li><a href="/contact" className="hover:text-white">Contact</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Support</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="/help" className="hover:text-white">Help Center</a></li>
            <li><a href="/privacy" className="hover:text-white">Privacy</a></li>
            <li><a href="/terms" className="hover:text-white">Terms</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
        <p>&copy; 2026 Proctolearn. All rights reserved.</p>
      </div>
    </footer>
  );
}
```

---

## 3. Add Banner to Dashboard

### Example 3: Dashboard Banner
```jsx
// In StudentDashboard.jsx, FacultyDashboard.jsx, etc.

import { motion } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { useState } from 'react';

export default function SubscriptionBanner() {
  const [showBanner, setShowBanner] = useState(true);

  if (!showBanner) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 rounded-lg mb-6 relative"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Bell className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">Stay Informed</h3>
            <p className="text-sm text-purple-100">
              Subscribe to get instant notifications about new quizzes and updates
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href="/subscribe" className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            Subscribe
          </a>
          <button
            onClick={() => setShowBanner(false)}
            className="p-1 hover:bg-purple-400 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Add to Dashboard:
// <SubscriptionBanner />
```

---

## 4. Sidebar Widget

### Example 4: Sidebar Newsletter Widget
```jsx
// Standalone widget component

import SubscriptionForm from './SubscriptionForm';
import { motion } from 'framer-motion';

export default function NewsletterWidget() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-20"
    >
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
        📰 Newsletter
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Get weekly updates on quizzes and platform news.
      </p>
      <SubscriptionForm variant="minimal" />
    </motion.div>
  );
}

// Usage in sidebar:
// <div className="space-y-6">
//   <NewsletterWidget />
// </div>
```

---

## 5. Modal Popup Subscribe

### Example 5: Modal Subscribe Dialog
```jsx
// In App.jsx or any page

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import SubscriptionForm from './SubscriptionForm';

export default function SubscribeModal() {
  const [isOpen, setIsOpen] = useState(false);

  // Show modal after 30 seconds of user being on site
  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if user hasn't subscribed (optional - check localStorage)
      const hasSubscribed = localStorage.getItem('hasSubscribed');
      if (!hasSubscribed) {
        setIsOpen(true);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  const handleSubscribe = () => {
    localStorage.setItem('hasSubscribed', 'true');
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Want to Stay Updated?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Subscribe to get instant notifications about new quizzes and platform updates delivered to your inbox.
            </p>

            <SubscriptionForm variant="default" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Add to App.jsx:
// <SubscribeModal />
```

---

## 6. Floating Subscribe Button

### Example 6: Floating Action Button
```jsx
// Sticky button in bottom right corner

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FloatingSubscribeButton() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-8 right-8 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-20 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-80 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">Newsletter</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <SubscriptionForm variant="minimal" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white p-4 rounded-full shadow-lg transition-all"
      >
        <Mail className="w-6 h-6" />
      </motion.button>
    </div>
  );
}

// Add to App.jsx:
// <FloatingSubscribeButton />
```

---

## 7. Exit Intent Popup

### Example 7: Show Modal When User Tries to Leave
```jsx
// Triggers when user moves mouse to top of window

import { useEffect, useState } from 'react';
import SubscribeModal from './SubscribeModal';

export default function ExitIntentPopup() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e) => {
      // Check if mouse moved toward top of window
      if (e.clientY <= 0) {
        const hasSeenExitIntent = localStorage.getItem('exitIntentShown');
        if (!hasSeenExitIntent) {
          setShowModal(true);
          localStorage.setItem('exitIntentShown', 'true');
        }
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, []);

  return showModal ? <SubscribeModal /> : null;
}

// Optional: Add expiration to localStorage
// setTimeout(() => {
//   localStorage.removeItem('exitIntentShown');
// }, 7 * 24 * 60 * 60 * 1000); // Reset after 7 days
```

---

## 8. Inline Form in Multiple Places

### Example 8: Multiple Form Placements
```jsx
// Uses different variants for different sections

export default function PageWithSubscription() {
  return (
    <div>
      {/* Hero Section - Inline variant */}
      <section className="py-20 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Welcome</h1>
          <p className="text-gray-600 mb-6">
            Join thousands of students using Proctolearn
          </p>
          <SubscriptionForm variant="inline" className="max-w-md" />
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Features</h2>
          {/* Features content */}
        </div>
      </section>

      {/* Side Section - Minimal variant */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Main content */}
          </div>
          <div>
            <SubscriptionForm variant="minimal" />
          </div>
        </div>
      </section>

      {/* Footer - Inline variant */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg mb-2">Newsletter</h3>
            <p className="text-gray-400">Get updates delivered to your inbox</p>
          </div>
          <div className="w-96">
            <SubscriptionForm variant="inline" />
          </div>
        </div>
      </footer>
    </div>
  );
}
```

---

## CSS Customization

### Custom Styling
```jsx
// Override default colors and sizes

<SubscriptionForm
  variant="default"
  className="!max-w-lg !shadow-2xl"
/>

// Or with inline styles
<div style={{ '--tw-shadow': '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}>
  <SubscriptionForm variant="default" />
</div>
```

---

## Best Practices

1. **Don't Overload Users**
   - Show subscription form in max 2-3 places
   - Use exit-intent or time-delay for modals
   - Respect user preferences

2. **Placement Matters**
   - Footer: Always safe, expected location
   - Header: Visible but not intrusive
   - Sidebar: Good for secondary placement
   - Modal: Use for important calls-to-action

3. **Design Consistency**
   - Use same form variant across similar sections
   - Match your brand colors
   - Keep spacing consistent

4. **Mobile Optimization**
   - Use `inline` variant for mobile footers
   - Keep modals full-width on small screens
   - Test responsive behavior

---

## A/B Testing Ideas

Try different approaches:
- Form in hero vs form in footer
- Early popup (10s) vs late popup (60s)
- "Subscribe" button vs "Stay Updated" button
- Required name field vs optional

Track which converts best using:
```javascript
// Track conversions
const trackSubscription = (source) => {
  window.gtag?.event('subscription', { source });
};
```

---

## Troubleshooting Integration

**Form not appearing:**
- Check SubscriptionForm is imported
- Verify API_URL in component
- Check browser console for errors

**Styling issues:**
- Ensure Tailwind CSS is configured
- Check for class conflicts
- Verify dark mode setup

**Email not sending:**
- Check SMTP credentials
- Test with direct API call
- Review server logs

---

## Summary

You can now integrate the subscription system into your Proctolearn platform in multiple ways:

- ✅ Landing page hero section
- ✅ Footer newsletter widget
- ✅ Dashboard banner
- ✅ Sidebar widget
- ✅ Modal popup
- ✅ Floating button
- ✅ Exit-intent popup
- ✅ Inline in multiple sections

Choose the placements that make sense for your user flow and brand!
