import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Reveal from '../components/Reveal';
import { CheckCircle, Eye, EyeOff, GraduationCap, Lock, Mail, User } from 'lucide-react';
import api from '../services/api';
import { signInWithGoogle, completeSupabaseOAuth } from '../config/firebaseConfig';
import { useAuthStore } from '../context/store';
import AuthNavbar from '../components/Common/AuthNavbar';
import AuthFooter from '../components/Common/AuthFooter';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const Register = () => {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();

  const secureCode = 'NIL-PROCTO2912';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    enrollmentNumber: '',
    institutionCode: 'PPSU',
    adminCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const handleSupabaseCallback = async () => {
      const hasOAuthParams =
        window.location.hash.includes('access_token') ||
        window.location.hash.includes('refresh_token') ||
        window.location.search.includes('code=');

      if (!hasOAuthParams) return;

      setOauthLoading(true);

      try {
        const session = await completeSupabaseOAuth();
        if (!session?.provider_token) {
          throw new Error('Google provider token not returned from Supabase.');
        }

        const response = await api.post('/auth/google', {
          accessToken: session.provider_token,
          institutionCode: 'DEFAULT'
        });

        if (response.data.success) {
          const userData = response.data.data.user;
          const token = response.data.data.token;

          setToken(token);
          setUser(userData);
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));

          const role = userData.role?.toLowerCase();
          if (role === 'admin') navigate('/admin/dashboard');
          else if (role === 'faculty') navigate('/faculty/dashboard');
          else navigate('/student/dashboard');
        } else {
          toast.error(response.data.message || 'Google sign-in failed.');
        }
      } catch (error) {
        const message = error?.response?.data?.message || error.message || 'Google sign-in failed.';
        toast.error(message);
      } finally {
        setOauthLoading(false);
      }
    };

    handleSupabaseCallback();
  }, [navigate, setToken, setUser]);

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.firstName.trim()) nextErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) nextErrors.lastName = 'Last name is required';

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = 'Enter a valid email address';
    }

    if (formData.password.length < 6) nextErrors.password = 'Password must be at least 6 characters';
    if (formData.confirmPassword !== formData.password) nextErrors.confirmPassword = 'Passwords do not match';

    const role = formData.role;
    if (!formData.enrollmentNumber.trim()) {
      if (role === 'faculty') nextErrors.enrollmentNumber = 'Faculty ID is required';
      else if (role === 'admin') nextErrors.enrollmentNumber = 'Admin ID is required';
      else nextErrors.enrollmentNumber = 'Enrollment number is required';
    }

    if (role === 'admin') {
      if (!formData.adminCode.trim()) {
        nextErrors.adminCode = 'Security code is required for admin';
      } else if (formData.adminCode.trim() !== secureCode) {
        nextErrors.adminCode = 'Invalid security code';
      }
    }

    return nextErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const firstError = Object.values(validationErrors)[0];
      toast.error(firstError);
      return;
    }

    try {
      setLoading(true);
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        enrollmentNumber: formData.enrollmentNumber,
        institutionCode: formData.institutionCode
      };

      if (formData.role === 'admin') {
        payload.adminCode = formData.adminCode;
      }
      
      console.log('📤 Sending registration request:', payload);
      const response = await api.post('/auth/register', payload);
      console.log('📥 Registration response:', response.data);
      
      toast.success('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      console.error('Registration error:', error.message);
      let message = 'Registration failed. Please try again.';
      
      // Only show safe error messages
      if (error?.response?.data?.message) {
        const backendMsg = error.response.data.message;
        // Filter out technical details
        if (!backendMsg.toLowerCase().includes('server') && 
            !backendMsg.toLowerCase().includes('backend') &&
            !backendMsg.toLowerCase().includes('port') &&
            !backendMsg.toLowerCase().includes('api')) {
          message = backendMsg;
        }
      }
      
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setOauthLoading(true);
    try {
      await signInWithGoogle();
      setOauthLoading(false);
    } catch (error) {
      const message = error?.message || 'Google sign-in failed.';
      toast.error(message);
      setOauthLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Navbar */}
      <AuthNavbar />
      
      {/* Main Content */}
      <div className="flex-1 px-4 lg:px-8 py-24 flex items-center justify-center">
        <div className="mx-auto w-full max-w-7xl flex flex-col items-center gap-8 lg:flex-row lg:items-stretch">
        <Reveal direction="left" delay={0.1}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative flex-1 min-w-[320px] max-w-[720px] overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 p-10 lg:p-14 text-white shadow-2xl"
          >
          <motion.div variants={itemVariants} className="mb-8 inline-flex items-center gap-3 rounded-2xl bg-white/10 px-5 py-3 backdrop-blur">
            <CheckCircle className="h-6 w-6" />
            <div>
              <h1 className="text-xl font-bold">PROCTOLEARN</h1>
              <p className="text-xs text-emerald-100 uppercase tracking-wider font-semibold">Nexus TechSol</p>
            </div>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-4xl font-bold leading-tight sm:text-5xl">
            Join Proctolearn
          </motion.h1>
          <motion.p variants={itemVariants} className="mt-4 max-w-xl text-base text-emerald-50 sm:text-lg">
            Create your account to access secure grievance management with real-time tracking and transparency.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-10 space-y-4 text-base">
            {["Instant account verification", "Secure & encrypted", "Role-based access"].map((line, idx) => (
              <div key={idx} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                <CheckCircle className="h-5 w-5" />
                <span>{line}</span>
              </div>
            ))}
          </motion.div>

          <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 bottom-10 h-48 w-48 rounded-full bg-teal-400/20 blur-3xl" />
        </motion.div>
        </Reveal>

        <div className="flex-1 w-full max-w-[720px]">
          <Reveal direction="right" delay={0.2}>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="rounded-3xl bg-white p-8 lg:p-12 shadow-xl ring-1 ring-slate-100"
            >
            <motion.div variants={itemVariants} className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900">Create Account</h2>
              <p className="mt-2 text-base text-slate-500">Start your journey with secure, proctored quizzes.</p>
            </motion.div>

            <motion.form variants={itemVariants} onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  error={errors.firstName}
                  icon={<User className="h-4 w-4" />}
                  required
                />
                <Field
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  error={errors.lastName}
                  icon={<User className="h-4 w-4" />}
                  required
                />
              </div>

              <Field
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
                icon={<Mail className="h-4 w-4" />}
                required
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  error={errors.password}
                  icon={<Lock className="h-4 w-4" />}
                  required
                  trailing={
                    <button type="button" onClick={() => setShowPassword((p) => !p)} className="text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                />
                <Field
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  error={errors.confirmPassword}
                  icon={<Lock className="h-4 w-4" />}
                  required
                  trailing={
                    <button type="button" onClick={()   => setShowConfirmPassword((p) => !p)} className="text-slate-400 hover:text-slate-600">
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="Select Role"
                  name="role"
                  as="select"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  options={[
                    { value: 'student', label: 'Student', icon: <GraduationCap className="h-4 w-4" /> },
                    { value: 'faculty', label: 'Faculty', icon: <User className="h-4 w-4" /> },
                    { value: 'admin', label: 'Admin', icon: <Lock className="h-4 w-4" /> }
                  ]}
                />
                <Field
                  label={
                    formData.role === 'faculty'
                      ? 'Faculty ID'
                      : formData.role === 'admin'
                        ? 'Admin ID'
                        : 'Enrollment Number'
                  }
                  name="enrollmentNumber"
                  value={formData.enrollmentNumber}
                  onChange={handleInputChange}
                  error={errors.enrollmentNumber}
                  required
                  icon={<GraduationCap className="h-4 w-4" />}
                />
              </div>

              {formData.role === 'admin' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <Field
                    label="Security Code"
                    name="adminCode"
                    type="password"
                    value={formData.adminCode}
                    onChange={handleInputChange}
                    error={errors.adminCode}
                    icon={<Lock className="h-4 w-4" />}
                    placeholder="Enter security code"
                    required
                  />
                  <div className="text-xs bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded-lg">
                    ⚠️ Admin role requires a valid security code for security
                  </div>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:opacity-60"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>

              {formData.role !== 'admin' && (
                <>
                  <div className="relative py-2 text-center text-xs font-semibold uppercase text-slate-400">
                    <span className="relative bg-white px-3">or</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={oauthLoading}
                    className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
                  >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
                    {oauthLoading ? 'Connecting to Google...' : 'Continue with Google'}
                  </button>
                </>
              )}
            </motion.form>

            <motion.p variants={itemVariants} className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">Log in</Link>
            </motion.p>
          </motion.div>
          </Reveal>
        </div>
      </div>
      </div>

      {/* Footer */}
      <AuthFooter />
    </div>
  );
};

function Field({ label, name, value, onChange, error, icon, as, options, type = 'text', required, trailing }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const isSelect = as === 'select';

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isSelect) return;
    // Close the dropdown whenever the value changes (e.g., after selecting an option)
    setIsOpen(false);
  }, [isSelect, value]);

  if (as === 'select') {
    const selectedOption = options?.find(opt => opt.value === value);
    
    return (
      <label className="block text-sm font-medium text-slate-700">
        {label}{required && <span className="text-rose-500 ml-1">*</span>}
        <div className="mt-1 relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full flex items-center gap-2 rounded-xl border-2 transition-all duration-300 ${
              error ? 'border-rose-300 bg-rose-50/30' : isOpen ? 'border-emerald-500 bg-emerald-50/50' : 'border-emerald-200 bg-gradient-to-r from-white to-emerald-50/40'
            } px-3 py-2.5 shadow-sm focus:outline-none focus:ring-2 ${error ? 'focus:ring-rose-200' : 'focus:ring-emerald-200'} hover:border-emerald-400 hover:shadow-md`}>
            <div className="flex-1 flex items-center gap-2 text-left">
              {selectedOption?.icon && <span className="text-emerald-600">{selectedOption.icon}</span>}
              <span className="text-sm font-medium text-slate-900">{selectedOption?.label || label}</span>
            </div>
            <svg className={`w-5 h-5 text-emerald-600 transition-all duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl border-2 border-emerald-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
              {options?.map((opt, idx) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange({ target: { name, value: opt.value } });
                    // Close immediately even if same value was selected
                    setIsOpen(false);
                    // Safety to ensure close after state updates
                    requestAnimationFrame(() => setIsOpen(false));
                  }}
                  style={{
                    animation: `slideIn 300ms ease-out ${idx * 30}ms both`,
                  }}
                  className={`relative overflow-hidden group w-full px-4 py-3 text-left text-sm font-medium transition-all duration-200 flex items-center gap-3 hover:bg-emerald-50/80 ${
                    opt.value === value
                      ? 'bg-emerald-100 text-emerald-900 border-l-4 border-l-emerald-600'
                      : 'text-slate-700 hover:text-emerald-900'
                  } ${idx !== (options?.length - 1) ? 'border-b border-slate-100' : ''}`}>
                  {opt.icon && <span className={opt.value === value ? 'text-emerald-700' : 'text-slate-400'}>{opt.icon}</span>}
                  {opt.label}
                  <span className={`pointer-events-none absolute left-3 right-3 bottom-1 h-0.5 bg-emerald-500/70 origin-left transition-transform duration-200 ${
                    opt.value === value ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}></span>
                </button>
              ))}
            </div>
          )}

          {isOpen && (
            <style>{`
              @keyframes slideIn {
                from {
                  opacity: 0;
                  transform: translateY(-8px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>
          )}
        </div>
        {error && <span className="mt-1 block text-xs text-rose-600 animate-pulse">{error}</span>}
      </label>
    );
  }

  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}{required && <span className="text-rose-500 ml-1">*</span>}
      <div className={`mt-1 flex items-center gap-2 rounded-xl border-2 transition-all duration-300 ${
        error ? 'border-rose-300 bg-rose-50/30 focus-within:ring-rose-200' : 'border-emerald-200 bg-gradient-to-r from-white to-emerald-50/40 focus-within:ring-emerald-200'
      } px-3 py-2.5 shadow-sm focus-within:border-emerald-500 focus-within:ring-2 hover:border-emerald-400 hover:shadow-md hover:scale-[1.01] group`}>
        {icon && <span className={`transition-colors duration-300 ${error ? 'text-rose-400' : 'text-emerald-600 group-hover:text-emerald-700'}`}>{icon}</span>}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={label}
          className="w-full bg-transparent text-sm text-slate-900 outline-none transition-colors duration-300 placeholder:text-slate-300"
        />
        {trailing}
      </div>
      {error && <span className="mt-1 block text-xs text-rose-600 animate-pulse">{error}</span>}
    </label>
  );
}

export default Register;
