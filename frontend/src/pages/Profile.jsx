import { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getMyProfile, updateMyProfile, getMySubmissions } from '../services/studentService';
import { useAuthStore } from '../context/store';
import Header from '../components/Layout/Header';
import { User, Mail, Phone, Award, Calendar, Edit2, X, Save } from 'lucide-react';

const initialForm = {
  firstName: '',
  lastName: '',
  phone: '',
  profilePicture: '',
  bio: ''
};

const getRoleColor = (role) => {
  const colors = {
    admin: 'from-red-500 to-red-600',
    faculty: 'from-emerald-500 to-lime-500',
    student: 'from-purple-500 to-pink-500',
  };
  return colors[role] || 'from-gray-500 to-gray-600';
};

const getRoleBadgeColor = (role) => {
  const colors = {
    admin: 'bg-red-100 text-red-700',
    faculty: 'bg-emerald-100 text-emerald-700',
    student: 'bg-purple-100 text-purple-700',
  };
  return colors[role] || 'bg-gray-100 text-gray-700';
};

const getRoleLabel = (role) => {
  const labels = {
    admin: 'Administrator',
    faculty: 'Faculty Member',
    student: 'Student',
  };
  return labels[role] || role;
};

export default function Profile() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [previewImage, setPreviewImage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);
  const { setUser, user: currentUser } = useAuthStore();

  const fullName = useMemo(() => {
    if (!profile) return '';
    return `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
  }, [profile]);

  const load = async () => {
    try {
      const me = await getMyProfile();
      setProfile(me);
      const formData = {
        firstName: me?.firstName || '',
        lastName: me?.lastName || '',
        phone: me?.phone || '',
        profilePicture: me?.profilePicture || '',
        bio: me?.bio || ''
      };
      setForm(formData);
      setPreviewImage(me?.profilePicture || '');
      
      if (me?.role === 'student') {
        try {
          const subs = await getMySubmissions();
          setSubmissions(subs);
        } catch (e) {
          console.log('Submissions not available for this role');
        }
      }
    } catch (e) {
      console.error('Failed to load profile:', e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setPreviewImage(base64String);
      setForm((prev) => ({ ...prev, profilePicture: base64String }));
      toast.success('Image selected! Click "Save Changes" to update.');
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const onSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        firstName: form.firstName?.trim(),
        lastName: form.lastName?.trim(),
        phone: form.phone?.trim(),
        profilePicture: form.profilePicture?.trim(),
        bio: form.bio?.trim(),
      };
      
      const res = await updateMyProfile(payload);
      if (res.success) {
        toast.success('✅ Profile updated successfully!');
        
        const updatedUser = { ...currentUser, ...res.data };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        await load();
        setIsEditing(false);
      } else {
        toast.error(res.message || 'Update failed');
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      setForm({
        firstName: profile?.firstName || '',
        lastName: profile?.lastName || '',
        phone: profile?.phone || '',
        profilePicture: profile?.profilePicture || '',
        bio: profile?.bio || ''
      });
      setPreviewImage(profile?.profilePicture || '');
    }
    setIsEditing(!isEditing);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 pt-14 sm:pt-16 md:pt-20 pb-8 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6 sm:mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">My Profile</h1>
            <p className="text-base sm:text-lg text-gray-600">Update your information below</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-4 sm:p-6 md:p-8 border border-emerald-100"
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="flex-shrink-0 relative group">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                {previewImage || profile?.profilePicture ? (
                  <img 
                    src={previewImage || profile?.profilePicture} 
                    alt="Profile" 
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover ring-4 ring-emerald-200 hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg"
                    onClick={handleUploadClick}
                  />
                ) : (
                  <div 
                    className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br ${getRoleColor(profile?.role)} flex items-center justify-center text-white text-4xl sm:text-5xl font-bold ring-4 ring-emerald-200 hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg`}
                    onClick={handleUploadClick}
                  >
                    {fullName ? fullName[0].toUpperCase() : 'U'}
                  </div>
                )}
                {isEditing && (
                  <button
                    onClick={handleUploadClick}
                    className="absolute bottom-0 right-0 bg-emerald-500 text-white p-2 rounded-full shadow-lg hover:bg-emerald-600 transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                )}
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{fullName || 'User'}</h2>
                <span className={`${getRoleBadgeColor(profile?.role)} font-semibold text-sm sm:text-base px-3 py-1 rounded-full inline-block mb-2`}>
                  {getRoleLabel(profile?.role)}
                </span>
                {profile?.email && (
                  <p className="text-sm sm:text-base text-gray-600 flex items-center justify-center sm:justify-start gap-2 mt-2">
                    <Mail size={16} className="text-emerald-600" />
                    {profile.email}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-center sm:justify-end mb-6">
              <button
                onClick={toggleEdit}
                className="px-4 sm:px-6 py-2 bg-gradient-to-r from-emerald-500 to-lime-500 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-lime-600 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-sm sm:text-base"
              >
                {isEditing ? (
                  <span className="flex items-center gap-2">
                    <X size={18} /> Cancel Edit
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Edit2 size={18} /> Edit Profile
                  </span>
                )}
              </button>
            </div>

            <AnimatePresence>
              {isEditing && (
                <motion.form
                  initial={{ opacity: 0, maxHeight: 0 }}
                  animate={{ opacity: 1, maxHeight: 2000 }}
                  exit={{ opacity: 0, maxHeight: 0 }}
                  transition={{ duration: 0.5 }}
                  onSubmit={onSave}
                  className="space-y-4 overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={form.firstName}
                        onChange={onChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={form.lastName}
                        onChange={onChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={onChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio (Optional)</label>
                    <textarea
                      name="bio"
                      value={form.bio}
                      onChange={onChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100 mt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-lime-500 text-white font-medium py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-lime-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Save size={18} />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={toggleEdit}
                      className="flex-1 bg-gray-100 text-gray-700 font-medium py-3 px-6 rounded-xl hover:bg-gray-200 transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {!isEditing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                    <div className="flex items-center gap-2 text-emerald-700 mb-1">
                      <User size={16} />
                      <span className="text-sm font-medium">Full Name</span>
                    </div>
                    <p className="text-gray-900 font-semibold">{fullName || 'Not set'}</p>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                    <div className="flex items-center gap-2 text-emerald-700 mb-1">
                      <Phone size={16} />
                      <span className="text-sm font-medium">Phone</span>
                    </div>
                    <p className="text-gray-900 font-semibold">{form.phone || 'Not set'}</p>
                  </div>
                </div>
                {form.bio && (
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                    <div className="flex items-center gap-2 text-emerald-700 mb-2">
                      <Award size={16} />
                      <span className="text-sm font-medium">Bio</span>
                    </div>
                    <p className="text-gray-700">{form.bio}</p>
                  </div>
                )}
              </motion.div>
            )}

            {profile?.role === 'student' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8 p-4 sm:p-6 bg-emerald-50 rounded-xl border border-emerald-100"
              >
                <h3 className="text-lg sm:text-xl font-bold text-emerald-800 mb-4 flex items-center gap-2">
                  <Calendar size={20} />
                  Quiz History
                </h3>
                {submissions.length === 0 ? (
                  <p className="text-gray-600 text-center py-4">No quizzes taken yet. Start learning!</p>
                ) : (
                  <div className="space-y-3">
                    {submissions.map((s) => (
                      <div key={s._id} className="bg-white p-4 rounded-lg shadow-sm border border-emerald-100 hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <p className="font-semibold text-gray-900">{s.quiz?.title || 'Untitled Quiz'}</p>
                            <p className="text-sm text-gray-500">{s.quiz?.subject || '-'}</p>
                          </div>
                          <div className="flex flex-col sm:items-end gap-1">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              s.status === 'graded' ? 'bg-green-100 text-green-700' : 
                              s.status === 'submitted' ? 'bg-teal-100 text-teal-700' : 
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {s.status}
                            </span>
                            {s.score != null && s.totalMarks != null && (
                              <span className="text-sm font-semibold text-emerald-700">
                                Score: {s.score}/{s.totalMarks}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
