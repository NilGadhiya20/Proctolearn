import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronRight,
  Rocket,
  Eye,
  Users,
  Lock,
  Mail,
  Phone,
  MessageCircle,
  Calendar,
  Camera,
  Shield,
  FileText,
  Award,
  Clock,
  Settings,
  User,
  BookOpen,
  Home,
  Zap,
  BarChart3,
  CreditCard,
  LogIn,
  UserPlus,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from 'lucide-react';
import { useAuthStore } from '../context/store';

const Support = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Scroll to section function for navbar
  const scrollToSection = (sectionId) => {
    navigate('/');
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const faqCategories = [
    { id: 'all', name: 'All Topics', icon: HelpCircle, color: 'text-emerald-600' },
    { id: 'getting-started', name: 'Getting Started', icon: Rocket, color: 'text-blue-600' },
    { id: 'proctoring', name: 'Proctoring & Monitoring', icon: Eye, color: 'text-orange-600' },
    { id: 'quiz-management', name: 'Quiz Management', icon: FileText, color: 'text-purple-600' },
    { id: 'account', name: 'Account & Privacy', icon: Lock, color: 'text-red-600' },
    { id: 'technical', name: 'Technical Support', icon: Settings, color: 'text-gray-600' }
  ];

  const faqs = [
    // Getting Started
    {
      category: 'getting-started',
      question: 'How do I create my first quiz?',
      answer: `To create your first quiz in Proctolearn:
      
1. **Login** to your faculty account
2. **Navigate** to the Faculty Dashboard
3. **Click** "Create New Quiz" button
4. **Fill in** quiz details (title, description, duration, instructions)
5. **Add Questions** using our question builder
6. **Configure** proctoring settings (camera, screen sharing, AI monitoring)
7. **Set** scheduling and availability options
8. **Review** and publish your quiz

Your quiz will be available to assigned students immediately or at your scheduled time.`
    },
    {
      category: 'getting-started',
      question: 'What information do I need to provide during registration?',
      answer: `For student registration, you need:
      
**Required Information:**
- Full name
- Valid email address
- Student ID number
- Institution/College name
- Password (minimum 8 characters)

**For Faculty Registration:**
- Full name
- Professional email address
- Faculty ID or Employee number
- Institution/Department
- Teaching credentials verification

**Additional Setup:**
- Profile photo (recommended)
- Contact information
- Preferred notification settings`
    },
    {
      category: 'getting-started',
      question: 'How do I join an existing quiz?',
      answer: `To join a quiz as a student:

1. **Login** to your student account
2. **Go to** "Available Quizzes" section
3. **Find** your assigned quiz (or enter quiz code)
4. **Click** "Start Quiz" when available
5. **Complete** system requirements check
6. **Allow** camera and microphone permissions
7. **Read** quiz instructions carefully
8. **Begin** your proctored assessment

Make sure you have a stable internet connection and quiet environment.`
    },

    // Proctoring & Monitoring
    {
      category: 'proctoring',
      question: 'How does the AI proctoring system work?',
      answer: `Our AI proctoring system provides comprehensive monitoring:

**Real-time Detection:**
- Face recognition and head movement tracking
- Multiple person detection in frame
- Eye gaze tracking and focus monitoring
- Unusual device/browser activity

**Audio Analysis:**
- Voice recognition for unauthorized communication
- Background noise and conversation detection
- Phone ringing or keyboard sounds

**Screen Monitoring:**
- Tab switching and window changes
- Application usage tracking
- Screen sharing violations
- Copy-paste attempt detection

**Automated Reporting:**
- Instant flagging of suspicious activities
- Confidence scores for each violation
- Timestamped evidence collection
- Faculty review dashboard`
    },
    {
      category: 'proctoring',
      question: 'What are the camera and system requirements?',
      answer: `**Camera Requirements:**
- HD webcam (720p minimum, 1080p recommended)
- Clear face visibility throughout exam
- Adequate lighting on face
- Stable positioning (no movement)

**System Requirements:**
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+)
- Minimum 4GB RAM
- Stable internet (5+ Mbps recommended)
- Microphone for audio monitoring

**Environment Setup:**
- Quiet, well-lit room
- Clean desk space
- No other people in frame
- Remove unauthorized materials

**Browser Permissions:**
- Camera access (required)
- Microphone access (required)  
- Screen sharing (for some quiz types)
- Notification blocking`
    },
    {
      category: 'proctoring',
      question: 'Can I see what violations were detected during my exam?',
      answer: `**For Students:**
- You cannot view real-time violations during the exam
- Post-exam, you may request a review from your instructor
- Major violations are noted in your exam record
- You can appeal findings through proper channels

**For Faculty:**
- Full access to AI monitoring dashboard
- Timestamped violation reports with evidence
- Confidence scores for each detected incident
- Video playback of flagged moments
- Ability to review and override AI decisions

**Privacy Note:**
All monitoring data is encrypted and only accessible to authorized personnel for academic integrity purposes.`
    },

    // Quiz Management  
    {
      category: 'quiz-management',
      question: 'How do I schedule a quiz for multiple time slots?',
      answer: `**Multiple Time Slot Setup:**

1. **Create** your base quiz with all questions
2. **Go to** Scheduling section
3. **Add Multiple Sessions:**
   - Set different start times
   - Configure duration for each slot
   - Set capacity limits per session
4. **Assign Students** to specific time slots
5. **Configure** late entry policies
6. **Set** automatic notifications

**Advanced Options:**
- Random question pools per session
- Different difficulty levels
- Staggered start times (15-30 min intervals)
- Makeup session scheduling
- Time zone management for remote students`
    },
    {
      category: 'quiz-management',
      question: 'Can I reuse questions from previous quizzes?',
      answer: `**Question Bank Features:**

**Importing Questions:**
- Access your personal question library
- Import from previous quizzes
- Bulk import via CSV/Excel
- Copy questions between courses

**Question Categories:**
- Organize by subject, difficulty, topic
- Tag questions with keywords
- Create question pools for randomization
- Version control for question updates

**Sharing Options:**
- Share with department colleagues
- Institutional question banks
- Import from standard test banks
- Export questions for backup

**Quality Control:**
- Performance analytics per question
- Difficulty assessment based on responses
- Automatic flagging of problematic questions`
    },
    {
      category: 'quiz-management',
      question: 'How do I grade subjective questions?',
      answer: `**Manual Grading Process:**

1. **Access** grading dashboard after quiz completion
2. **Review** student responses by question
3. **Use** rubric-based scoring (if configured)
4. **Add** comments and feedback
5. **Assign** points within defined range
6. **Flag** exceptional responses for review

**Grading Tools:**
- Side-by-side response comparison
- Anonymous grading option
- Bulk comment insertion
- Grade distribution analytics
- Plagiarism detection for text responses

**Collaboration:**
- Multiple grader assignment
- Blind grading workflows
- Grade reconciliation process
- Quality assurance reviews`
    },

    // Account & Privacy
    {
      category: 'account',
      question: 'Is my personal information secure?',
      answer: `**Data Security Measures:**

**Encryption:**
- End-to-end encryption for all communications
- AES-256 encryption for stored data
- HTTPS/TLS for web traffic
- Encrypted backup systems

**Privacy Controls:**
- Minimal data collection policy
- User consent for all monitoring
- Right to data deletion
- Regular privacy audits

**Compliance:**
- FERPA compliant for educational records
- GDPR compliant for European users
- SOC 2 Type II certified
- Regular security penetration testing

**Access Control:**
- Multi-factor authentication
- Role-based permissions
- Session timeout controls
- Audit trails for all access`
    },
    {
      category: 'account',
      question: 'Can I update my quiz settings after students have started?',
      answer: `**During Active Quiz:**
- **Cannot Change:** Question content, point values, time limits
- **Can Modify:** Technical issues resolution, extend time for individuals
- **Emergency Actions:** Pause quiz, evacuate students, technical resets

**Before Quiz Starts:**
- Full editing capabilities
- Question modifications
- Timing adjustments
- Proctoring setting changes

**After Quiz Completion:**
- Grade adjustments with documentation
- Reopen for individual students (special circumstances)
- Add bonus questions or extra credit
- Export results and analytics

**Best Practices:**
- Finalize settings 24 hours before quiz
- Test with sample students
- Communicate changes clearly to students
- Document any modifications for records`
    },
    {
      category: 'account',
      question: 'How do I delete my account permanently?',
      answer: `**Account Deletion Process:**

**For Students:**
1. **Complete** all ongoing assessments
2. **Download** your academic records
3. **Contact** support with deletion request
4. **Verify** identity through email confirmation
5. **Confirm** understanding of data loss

**For Faculty:**
1. **Transfer** or complete all active courses
2. **Export** question banks and grade data
3. **Notify** institution administrators
4. **Submit** formal deletion request
5. **Complete** handover procedures

**Data Retention:**
- Academic records retained per institutional policy
- Anonymous analytics data may be retained
- Legal compliance data kept as required
- Backup data purged within 90 days

**Cannot Delete If:**
- Active investigations ongoing
- Legal holds in place
- Outstanding financial obligations`
    },

    // Technical Support
    {
      category: 'technical',
      question: 'Why can\'t I upload my camera feed?',
      answer: `**Common Camera Issues:**

**Browser Permissions:**
- Check camera permissions in browser settings
- Clear browser cache and cookies
- Disable other applications using camera
- Try incognito/private browsing mode

**Technical Troubleshooting:**
- Update browser to latest version
- Restart browser completely
- Check Windows/Mac camera privacy settings
- Test camera in other applications

**Network Issues:**
- Check internet connection stability
- Disable VPN if active
- Switch to ethernet from WiFi if possible
- Contact your network administrator

**Hardware Problems:**
- Ensure camera is properly connected
- Update camera drivers
- Try different USB port
- Test with external webcam if available

**Still Need Help?**
Contact our technical support with your device specifications and error messages.`
    },
    {
      category: 'technical',
      question: 'The website is not loading properly',
      answer: `**Quick Fixes:**

**Browser Issues:**
- Hard refresh (Ctrl+F5 or Cmd+Shift+R)
- Clear browser cache and cookies
- Disable browser extensions
- Try different browser (Chrome, Firefox, Safari)

**Connection Problems:**
- Check internet connection speed
- Restart router/modem
- Disable VPN or proxy
- Try mobile hotspot as backup

**System Issues:**
- Close unnecessary applications
- Restart computer
- Check for system updates
- Ensure sufficient RAM available

**Advanced Troubleshooting:**
- Check firewall settings
- Disable antivirus temporarily
- Use browser developer tools to check console errors
- Test from different network location

**Contact Support:**
If issues persist, contact us with your browser version, operating system, and specific error messages.`
    },
    {
      category: 'technical',
      question: 'I forgot my password, how do I reset it?',
      answer: `**Password Reset Steps:**

1. **Go to** login page
2. **Click** "Forgot Password" link
3. **Enter** your registered email address
4. **Check** your email for reset instructions
5. **Click** the secure reset link
6. **Create** a new strong password
7. **Confirm** the new password
8. **Login** with new credentials

**If Email Doesn't Arrive:**
- Check spam/junk folder
- Verify correct email address
- Wait 10-15 minutes for delivery
- Contact support if still not received

**Password Requirements:**
- Minimum 8 characters
- Include uppercase and lowercase letters
- At least one number
- Special character recommended
- Cannot reuse last 3 passwords

**Account Security:**
- Enable two-factor authentication
- Use unique password for Proctolearn
- Regular password updates recommended`
    }
  ];

  const supportOptions = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get detailed help via email',
      contact: 'support@proctolearn.com',
      response: '24-48 hours response',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak directly with our team',
      contact: '+1 (555) 123-4567',
      response: 'Mon-Fri, 9AM-6PM EST',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Real-time assistance',
      contact: 'Chat with us now',
      response: 'Average wait: 2 minutes',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Calendar,
      title: 'Schedule Demo',
      description: 'Book a personalized walkthrough',
      contact: 'Schedule meeting',
      response: 'Available slots this week',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const quickTips = [
    {
      icon: Camera,
      title: 'Camera Setup',
      description: 'Position camera at eye level for best face detection',
      tip: 'Ensure good lighting and stable positioning'
    },
    {
      icon: Shield,
      title: 'Secure Environment',
      description: 'Use a quiet room with no other people visible',
      tip: 'Remove unauthorized materials from desk area'
    },
    {
      icon: Award,
      title: 'Best Performance',
      description: 'Close unnecessary applications during assessment',
      tip: 'Use Chrome browser for optimal compatibility'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Enhanced Styles */}
      <style>{`
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #10b981, #84cc16);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #059669, #65a30d);
        }

        /* Hover effects */
        .hover-lift {
          transition: all 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(16, 185, 129, 0.2);
        }

        .hover-scale:hover {
          transform: scale(1.02);
        }

        .hover-glow {
          transition: all 0.3s ease;
        }

        .hover-glow:hover {
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.3);
        }

        /* FAQ Card hover effect */
        .faq-card {
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .faq-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.05), transparent);
          transition: left 0.5s ease;
        }
        
        .faq-card:hover::before {
          left: 100%;
        }
        
        .faq-card:hover {
          transform: translateX(4px);
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.15);
          border-left: 4px solid #10b981;
        }

        /* Category button effects */
        .category-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .category-btn:hover {
          transform: translateX(4px);
        }

        /* Support card pulse effect */
        @keyframes pulse-border {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          50% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
        }

        .support-card:hover {
          animation: pulse-border 1.5s infinite;
        }
      `}</style>

      {/* Navbar */}
      <nav className="bg-white/95 backdrop-blur-xl border-b border-emerald-200/60 shadow-lg fixed top-0 left-0 right-0 w-full z-[9999]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo - Left */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-lime-500 rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-emerald-200/50 hover:scale-110 transition-all duration-300 cursor-pointer hover-lift">
                  <span className="text-white font-bold text-xl">PL</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-lime-500 bg-clip-text text-transparent tracking-tight cursor-pointer">
                  Proctolearn
                </span>
              </Link>
            </div>

            {/* Desktop Nav Links - Center */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 xl:gap-8 mx-1 sm:mx-2 md:mx-4 lg:mx-10">
              <Link to="/" className="nav-link flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-bold py-2 px-2 hover:scale-110 transition-all duration-300 hover-lift" title="Home">
                <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm md:text-base">Home</span>
              </Link>
              {user?.role === 'student' && (
                <Link to="/available-quizzes" className="nav-link flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-bold py-2 px-2 hover:scale-110 transition-all duration-300 hover-lift" title="Quizzes">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm md:text-base">Quizzes</span>
                </Link>
              )}
              <button onClick={() => scrollToSection('features')} className="nav-link flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-bold py-2 px-2 hover:scale-110 transition-all duration-300 hover-lift" title="Features">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm md:text-base">Features</span>
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="nav-link flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-bold py-2 px-2 hover:scale-110 transition-all duration-300 hover-lift" title="How it Works">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden lg:inline text-sm xl:text-base">How it Works</span>
              </button>
              <Link to="/pricing" className="nav-link flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-bold py-2 px-2 hover:scale-110 transition-all duration-300 hover-lift" title="Pricing">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden lg:inline text-sm xl:text-base">Pricing</span>
              </Link>
              <Link to="/support" className="nav-link flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-bold py-2 px-2 hover:scale-110 transition-all duration-300 hover-lift" title="Help">
                <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden lg:inline text-sm xl:text-base">Help</span>
              </Link>
            </div>

            {/* Right Side - Auth Buttons */}
            <div className="flex items-center gap-2 lg:gap-3">
              {!user && (
                <>
                  <Link
                    to="/login"
                    className="nav-link flex items-center gap-1.5 text-emerald-700 hover:text-white font-bold px-2 sm:px-3 lg:px-6 py-2 lg:py-3 rounded-xl hover:bg-gradient-to-r hover:from-emerald-500 hover:to-lime-500 hover:shadow-lg hover:scale-110 transition-all duration-300 border-2 border-transparent hover:border-emerald-400 hover-lift"
                    title="Login"
                  >
                    <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-sm md:text-base">Login</span>
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-lime-500 text-white font-bold px-2 sm:px-3 md:px-4 lg:px-8 py-2 lg:py-3 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-emerald-500/50 hover:-translate-y-1 hover:scale-110 hover:from-emerald-600 hover:to-lime-600 transition-all duration-400 transform-gpu active:scale-95 hover-lift"
                    title="Sign Up"
                  >
                    <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-sm md:text-base">Sign Up</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-lime-500 text-white py-24 pt-32">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                repeatDelay: 2
              }}
            >
              <HelpCircle className="w-16 h-16 mx-auto mb-6 opacity-90" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              How Can We Help?
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8">
              Find answers to common questions or reach out to our support team
            </p>
            
            {/* Search Bar */}
            <motion.div 
              className="relative max-w-2xl mx-auto"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 rounded-2xl text-gray-800 text-lg focus:ring-4 focus:ring-white/30 focus:outline-none shadow-2xl hover:shadow-3xl transition-all duration-300"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sticky top-24 hover-glow">
              <h3 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                Browse Topics
              </h3>
              <div className="space-y-3">
                {faqCategories.map((category) => (
                  <motion.button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`category-btn w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 text-left ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-emerald-500 to-lime-500 text-white shadow-lg scale-105'
                        : 'hover:bg-emerald-50 text-gray-700 hover:text-emerald-700'
                    }`}
                  >
                    <category.icon className={`w-5 h-5 ${selectedCategory === category.id ? 'text-white' : category.color}`} />
                    <span className="font-medium text-sm">{category.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* FAQ Section */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-6 h-6 text-emerald-600" />
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Frequently Asked Questions
                </h2>
                <motion.span 
                  whileHover={{ scale: 1.1 }}
                  className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold shadow-md"
                >
                  {filteredFaqs.length} questions
                </motion.span>
              </div>

              <div className="space-y-4">
                {filteredFaqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="faq-card bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
                  >
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-emerald-50/50 rounded-2xl transition-all duration-200"
                    >
                      <span className="font-semibold text-gray-800 pr-4 text-base md:text-lg">
                        {faq.question}
                      </span>
                      <motion.div
                        animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {expandedFaq === index ? (
                          <ChevronDown className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                      </motion.div>
                    </button>
                    
                    {expandedFaq === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-6 pb-6"
                      >
                        <div className="border-t border-emerald-100 pt-4">
                          <div className="text-gray-600 leading-relaxed whitespace-pre-line text-sm md:text-base">
                            {faq.answer}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>

              {filteredFaqs.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16 bg-white/80 rounded-2xl shadow-lg"
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                  >
                    <HelpCircle className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  </motion.div>
                  <p className="text-gray-500 text-lg font-semibold mb-2">
                    No questions found matching your search.
                  </p>
                  <p className="text-gray-400 mt-2">
                    Try a different search term or browse our categories.
                  </p>
                </motion.div>
              )}
            </div>

            {/* Contact Support */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover-glow">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 text-center">
                Still Need Help?
              </h2>
              <p className="text-gray-600 text-center mb-8">
                Choose your preferred way to reach us
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {supportOptions.map((option, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`support-card bg-gradient-to-r ${option.color} p-6 rounded-2xl text-white cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-300`}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <motion.div 
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center"
                      >
                        <option.icon className="w-7 h-7" />
                      </motion.div>
                      <div>
                        <h3 className="font-bold text-lg">{option.title}</h3>
                        <p className="opacity-90 text-sm">{option.description}</p>
                      </div>
                    </div>
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 hover:bg-white/25 transition-all duration-300">
                      <p className="font-semibold text-base">{option.contact}</p>
                      <p className="text-sm opacity-90 mt-1">{option.response}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-r from-emerald-600 to-lime-600 rounded-2xl p-8 text-white shadow-2xl hover-glow">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-2xl md:text-3xl font-bold mb-8 text-center"
              >
                💡 Quick Tips
              </motion.h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {quickTips.map((tip, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300 border border-white/20"
                  >
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.2 }}
                      transition={{ duration: 0.5 }}
                    >
                      <tip.icon className="w-10 h-10 mx-auto mb-4 opacity-90" />
                    </motion.div>
                    <h3 className="font-bold text-lg mb-3">{tip.title}</h3>
                    <p className="text-sm opacity-90 mb-3 leading-relaxed">{tip.description}</p>
                    <p className="text-xs opacity-80 italic bg-white/10 rounded-lg px-3 py-2">
                      {tip.tip}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-lime-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  PL
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-lime-400 bg-clip-text text-transparent">
                  Proctolearn
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                AI-Powered Proctored Assessment Platform - Making online education secure, transparent and accountable.
              </p>
              <div className="flex gap-3">
                {[
                  { name: 'Facebook', icon: Facebook },
                  { name: 'Twitter', icon: Twitter },
                  { name: 'Instagram', icon: Instagram },
                  { name: 'LinkedIn', icon: Linkedin }
                ].map((social) => {
                  const Icon = social.icon;
                  return (
                  <a
                    key={social.name}
                    href="#"
                    aria-label={social.name}
                    className="w-12 h-12 rounded-lg bg-slate-800/95 border border-slate-700 text-slate-200 hover:text-white hover:border-emerald-400 hover:bg-gradient-to-r hover:from-emerald-600 hover:to-lime-500 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/35 active:scale-95"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">QUICK LINKS</h3>
              <ul className="space-y-3">
                {[
                  { to: '/', label: 'Home' },
                  { to: '/available-quizzes', label: 'Available Quizzes' },
                  { to: '/create-quiz', label: 'Create Quiz' },
                  { onClick: () => scrollToSection('features'), label: 'Features' }
                ].map((link, idx) => (
                  <li key={idx}>
                    {link.to ? (
                      <Link to={link.to} className="group text-slate-400 hover:text-emerald-400 transition-all duration-200 text-sm inline-flex items-center no-underline hover:no-underline">
                        <span className="text-emerald-400 mr-2 opacity-0 translate-x-[-4px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">-&gt;</span>
                        {link.label}
                      </Link>
                    ) : (
                      <button onClick={link.onClick} className="group text-slate-400 hover:text-emerald-400 transition-all duration-200 text-sm inline-flex items-center">
                        <span className="text-emerald-400 mr-2 opacity-0 translate-x-[-4px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">-&gt;</span>
                        {link.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">RESOURCES</h3>
              <ul className="space-y-3">
                {['Documentation', 'FAQ', 'Blog'].map((item) => (
                  <li key={item}>
                    <a 
                      href="#" 
                      className="group text-slate-400 hover:text-emerald-400 transition-all duration-200 text-sm inline-flex items-center no-underline hover:no-underline"
                    >
                      <span className="text-emerald-400 mr-2 opacity-0 translate-x-[-4px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">-&gt;</span>
                      {item}
                    </a>
                  </li>
                ))}
                <li>
                  <Link to="/support" className="group text-slate-400 hover:text-emerald-400 transition-all duration-200 text-sm inline-flex items-center no-underline hover:no-underline">
                    <span className="text-emerald-400 mr-2 opacity-0 translate-x-[-4px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">-&gt;</span>
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">LEGAL</h3>
              <ul className="space-y-3">
                {['Privacy Policy', 'Terms of Use', 'Cookie Policy', 'Accessibility'].map((item) => (
                  <li key={item}>
                    <a 
                      href="#" 
                      className="group text-slate-400 hover:text-emerald-400 transition-all duration-200 text-sm inline-flex items-center no-underline hover:no-underline"
                    >
                      <span className="text-emerald-400 mr-2 opacity-0 translate-x-[-4px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">-&gt;</span>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Get In Touch */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">GET IN TOUCH</h3>
              <ul className="space-y-4">
                {[
                  { icon: 'envelope', color: 'emerald', label: 'Email', value: 'support@proctolearn.com', href: 'mailto:support@proctolearn.com' },
                  { icon: 'phone', color: 'lime', label: 'Phone', value: '+91-9909246267', href: 'tel:+919909246267' },
                  { icon: 'map-marker-alt', color: 'emerald', label: 'Address', value: 'Ahmedabad, Gujarat' }
                ].map((contact, idx) => (
                  <li 
                    key={idx} 
                    className="flex items-start gap-3"
                  >
                    <div className={`text-${contact.color}-400 mt-1`}>
                      <i className={`fas fa-${contact.icon}`}></i>
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">{contact.label}</p>
                      {contact.href ? (
                        <a 
                          href={contact.href} 
                          className="text-slate-400 text-sm hover:text-emerald-400 transition-colors no-underline hover:no-underline"
                        >
                          {contact.value}
                        </a>
                      ) : (
                        <p className="text-slate-400 text-sm">{contact.value}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Stay Updated Section */}
          <div className="border-t border-slate-800 pt-12 pb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-white font-bold text-2xl mb-2">Stay Updated</h3>
                  <p className="text-slate-400 text-sm">
                    Subscribe to get updates on new features, quizzes, and educational content.
                  </p>
                </div>
                <div className="flex-1 w-full md:max-w-md">
                  <div className="flex gap-3">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 px-6 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                    <button 
                      className="bg-gradient-to-r from-emerald-500 to-lime-500 text-white font-bold px-10 py-4 rounded-xl hover:shadow-2xl hover:shadow-emerald-500/60 hover:-translate-y-1 transition-all duration-400 hover:scale-110 hover:from-emerald-600 hover:to-lime-600 active:scale-95 relative overflow-hidden group"
                    >
                      <span className="relative z-10">Subscribe</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-lime-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-slate-500 text-sm">
                © 2026 Proctolearn. All rights reserved.
              </p>
              <div className="flex items-center gap-6 text-xs text-slate-500">
                {[
                  { icon: 'shield-alt', label: 'SSL Certified', color: 'emerald' },
                  { icon: 'lock', label: 'Bank-grade Security', color: 'emerald' },
                  { icon: 'check-circle', label: 'ISO Compliant', color: 'lime' }
                ].map((badge, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-2"
                  >
                    <i className={`fas fa-${badge.icon} text-${badge.color}-400`}></i>
                    <span>{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Support;
