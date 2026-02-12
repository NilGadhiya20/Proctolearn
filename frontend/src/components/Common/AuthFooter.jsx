import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Globe, ShieldCheck, Award, Lock, Server, Layers, CheckCircle2 } from 'lucide-react';

const AuthFooter = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-300 border-t border-gray-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* About Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">PROCTOLEARN</h3>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Nexus TechSol</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Advanced online proctoring system ensuring secure and fair examinations with AI-powered monitoring.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              <li><Link to="/" className="text-sm hover:text-green-400 transition-colors flex items-center gap-2"><span>→</span> Home</Link></li>
              <li><Link to="/about" className="text-sm hover:text-green-400 transition-colors flex items-center gap-2"><span>→</span> About Us</Link></li>
              <li><Link to="/transparency" className="text-sm hover:text-green-400 transition-colors flex items-center gap-2"><span>→</span> Transparency</Link></li>
              <li><Link to="/community" className="text-sm hover:text-green-400 transition-colors flex items-center gap-2"><span>→</span> Community</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2.5">
              <li><Link to="/documentation" className="text-sm hover:text-green-400 transition-colors flex items-center gap-2"><span>→</span> Documentation</Link></li>
              <li><Link to="/support" className="text-sm hover:text-green-400 transition-colors flex items-center gap-2"><span>→</span> Support</Link></li>
              <li><Link to="/blog" className="text-sm hover:text-green-400 transition-colors flex items-center gap-2"><span>→</span> Blog</Link></li>
              <li><Link to="/contact" className="text-sm hover:text-green-400 transition-colors flex items-center gap-2"><span>→</span> Contact</Link></li>
            </ul>
          </div>

          {/* Get In Touch */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Get In Touch</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <Mail size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span>support@proctolearn.com</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Phone size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span>+91-9999-XX-XXXX</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <MapPin size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span>New Delhi, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="bg-gray-800/50 rounded-xl p-6 mb-12 border border-gray-700">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h4 className="text-white font-semibold text-lg mb-2">Stay Updated</h4>
              <p className="text-sm text-gray-400">Subscribe to get updates on proctoring features and policy changes.</p>
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
              <button className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-teal-600 text-white text-sm font-semibold rounded-lg hover:from-green-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mb-8">
          <p className="text-center text-xs text-gray-500 uppercase tracking-wider mb-6">Trusted & Certified</p>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4 flex flex-col items-center justify-center border border-gray-700 hover:border-green-600 transition-colors">
              <Globe className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-xs text-center font-medium text-white">Government</p>
              <p className="text-xs text-gray-500">Approved</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 flex flex-col items-center justify-center border border-gray-700 hover:border-green-600 transition-colors">
              <Award className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-xs text-center font-medium text-white">ISO 27001</p>
              <p className="text-xs text-gray-500">Certified</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 flex flex-col items-center justify-center border border-gray-700 hover:border-green-600 transition-colors">
              <ShieldCheck className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-xs text-center font-medium text-white">GDPR</p>
              <p className="text-xs text-gray-500">Compliant</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 flex flex-col items-center justify-center border border-gray-700 hover:border-green-600 transition-colors">
              <Lock className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-xs text-center font-medium text-white">SSL</p>
              <p className="text-xs text-gray-500">Encrypted</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 flex flex-col items-center justify-center border border-gray-700 hover:border-green-600 transition-colors">
              <Server className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-xs text-center font-medium text-white">Digital</p>
              <p className="text-xs text-gray-500">India</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 flex flex-col items-center justify-center border border-gray-700 hover:border-green-600 transition-colors">
              <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-xs text-center font-medium text-white">E-Gov</p>
              <p className="text-xs text-gray-500">Certified</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © 2025 Proctolearn. All rights reserved. 
              <span className="hidden sm:inline"> | Made with ❤️ by Nexus Team</span>
            </p>
            <div className="flex gap-6 text-xs">
              <Link to="/privacy" className="text-gray-400 hover:text-green-400 transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-gray-400 hover:text-green-400 transition-colors">Terms of Use</Link>
              <Link to="/cookies" className="text-gray-400 hover:text-green-400 transition-colors">Cookie Policy</Link>
              <Link to="/accessibility" className="text-gray-400 hover:text-green-400 transition-colors">Accessibility</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AuthFooter;
