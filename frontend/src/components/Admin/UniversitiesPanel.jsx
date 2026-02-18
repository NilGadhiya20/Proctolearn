import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  School, Plus, Edit, Trash2, Power, Search, Filter,
  MapPin, Mail, Phone, Globe, Users, FileText, 
  CheckCircle, XCircle, Calendar, Building2
} from 'lucide-react';
import { useThemeContext } from '../../context/themeContext';
import toast from 'react-hot-toast';
import api from '../../services/api';

const UniversitiesPanel = () => {
  const { isDark } = useThemeContext();
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all'); // all, active, inactive
  const [showModal, setShowModal] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    website: '',
    description: '',
    subscriptionPlan: 'free'
  });

  useEffect(() => {
    fetchUniversities();
  }, [filterActive]);

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterActive !== 'all') {
        params.append('isActive', filterActive === 'active');
      }
      const response = await api.get(`/institutions?${params.toString()}`);
      setUniversities(response.data.data || []);
    } catch (error) {
      console.error('Error fetching universities:', error);
      toast.error('Failed to load universities');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUniversity) {
        await api.put(`/institutions/${editingUniversity._id}`, formData);
        toast.success('University updated successfully!');
      } else {
        await api.post('/institutions', formData);
        toast.success('University created successfully!');
      }
      setShowModal(false);
      resetForm();
      fetchUniversities();
    } catch (error) {
      console.error('Error saving university:', error);
      toast.error(error.response?.data?.message || 'Failed to save university');
    }
  };

  const handleEdit = (university) => {
    setEditingUniversity(university);
    setFormData({
      name: university.name || '',
      code: university.code || '',
      email: university.email || '',
      phone: university.phone || '',
      address: university.address || '',
      city: university.city || '',
      state: university.state || '',
      country: university.country || '',
      postalCode: university.postalCode || '',
      website: university.website || '',
      description: university.description || '',
      subscriptionPlan: university.subscriptionPlan || 'free'
    });
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.delete(`/institutions/${id}`);
      toast.success('University deleted successfully!');
      fetchUniversities();
    } catch (error) {
      console.error('Error deleting university:', error);
      toast.error(error.response?.data?.message || 'Failed to delete university');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/institutions/${id}/toggle-status`);
      toast.success(`University ${currentStatus ? 'deactivated' : 'activated'} successfully!`);
      fetchUniversities();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      website: '',
      description: '',
      subscriptionPlan: 'free'
    });
    setEditingUniversity(null);
  };

  const filteredUniversities = universities.filter(uni =>
    uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    uni.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    uni.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            Universities Management
          </h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Manage all registered universities and institutions
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Add University
        </button>
      </div>

      {/* Search and Filter */}
      <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-white'} border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <input
              type="text"
              placeholder="Search universities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isDark 
                  ? 'bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-500' 
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div className="flex gap-2">
            {['all', 'active', 'inactive'].map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterActive(filter)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  filterActive === filter
                    ? 'bg-blue-600 text-white shadow-lg'
                    : isDark
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Universities Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredUniversities.length === 0 ? (
        <div className={`text-center py-12 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-white'} border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <School className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
          <p className={`text-lg font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            No universities found
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUniversities.map((uni) => (
            <motion.div
              key={uni._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-xl border-2 ${
                uni.isActive
                  ? isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
                  : isDark ? 'bg-slate-800/30 border-slate-700/50' : 'bg-slate-100 border-slate-300'
              } hover:shadow-lg transition-all`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-600' : 'bg-blue-500'}`}>
                    <School className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                      {uni.name}
                    </h3>
                    <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {uni.code}
                    </span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  uni.isActive
                    ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                    : isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
                }`}>
                  {uni.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <Mail className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {uni.email}
                  </span>
                </div>
                {uni.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {uni.phone}
                    </span>
                  </div>
                )}
                {uni.city && (
                  <div className="flex items-center gap-2">
                    <MapPin className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {uni.city}, {uni.state}
                    </span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className={`flex items-center justify-between p-3 rounded-lg mb-4 ${isDark ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                <div className="text-center">
                  <div className={`text-lg font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    {uni.totalUsers || 0}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>Users</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                    {uni.totalQuizzes || 0}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>Quizzes</div>
                </div>
                <div className="text-center">
                  <span className={`text-lg font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    {uni.subscriptionPlan}
                  </span>
                  <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>Plan</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(uni)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                    isDark 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleToggleStatus(uni._id, uni.isActive)}
                  className={`flex items-center justify-center p-2 rounded-lg transition-all ${
                    uni.isActive
                      ? isDark ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                      : isDark ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                  title={uni.isActive ? 'Deactivate' : 'Activate'}
                >
                  <Power className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(uni._id, uni.name)}
                  className={`flex items-center justify-center p-2 rounded-lg transition-all ${
                    isDark 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
              } border-2 shadow-2xl`}
            >
              <div className={`sticky top-0 p-6 border-b ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <h3 className={`text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  {editingUniversity ? 'Edit University' : 'Add University'}
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      University Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full p-3 rounded-lg border ${
                        isDark 
                          ? 'bg-slate-900 border-slate-700 text-slate-200' 
                          : 'bg-white border-slate-300 text-slate-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className={`w-full p-3 rounded-lg border ${
                        isDark 
                          ? 'bg-slate-900 border-slate-700 text-slate-200' 
                          : 'bg-white border-slate-300 text-slate-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full p-3 rounded-lg border ${
                        isDark 
                          ? 'bg-slate-900 border-slate-700 text-slate-200' 
                          : 'bg-white border-slate-300 text-slate-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full p-3 rounded-lg border ${
                        isDark 
                          ? 'bg-slate-900 border-slate-700 text-slate-200' 
                          : 'bg-white border-slate-300 text-slate-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className={`w-full p-3 rounded-lg border ${
                        isDark 
                          ? 'bg-slate-900 border-slate-700 text-slate-200' 
                          : 'bg-white border-slate-300 text-slate-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      State
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className={`w-full p-3 rounded-lg border ${
                        isDark 
                          ? 'bg-slate-900 border-slate-700 text-slate-200' 
                          : 'bg-white border-slate-300 text-slate-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Country
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className={`w-full p-3 rounded-lg border ${
                        isDark 
                          ? 'bg-slate-900 border-slate-700 text-slate-200' 
                          : 'bg-white border-slate-300 text-slate-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className={`w-full p-3 rounded-lg border ${
                        isDark 
                          ? 'bg-slate-900 border-slate-700 text-slate-200' 
                          : 'bg-white border-slate-300 text-slate-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Subscription Plan
                    </label>
                    <select
                      value={formData.subscriptionPlan}
                      onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value })}
                      className={`w-full p-3 rounded-lg border ${
                        isDark 
                          ? 'bg-slate-900 border-slate-700 text-slate-200' 
                          : 'bg-white border-slate-300 text-slate-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="free">Free</option>
                      <option value="basic">Basic</option>
                      <option value="professional">Professional</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                    className={`w-full p-3 rounded-lg border ${
                      isDark 
                        ? 'bg-slate-900 border-slate-700 text-slate-200' 
                        : 'bg-white border-slate-300 text-slate-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className={`w-full p-3 rounded-lg border ${
                      isDark 
                        ? 'bg-slate-900 border-slate-700 text-slate-200' 
                        : 'bg-white border-slate-300 text-slate-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                      isDark 
                        ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' 
                        : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
                  >
                    {editingUniversity ? 'Update' : 'Create'} University
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UniversitiesPanel;
