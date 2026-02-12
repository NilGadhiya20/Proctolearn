import { useEffect, useState, useMemo, useRef } from 'react';
import { Box, Card, CardContent, CardHeader, Grid, TextField, Button, Avatar, Typography, Divider, Chip, Table, TableHead, TableRow, TableCell, TableBody, Stack, IconButton, Paper } from '@mui/material';
import { PhotoCamera, CloudUpload, Delete } from '@mui/icons-material';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getMyProfile, updateMyProfile, getMySubmissions } from '../services/studentService';
import { MainLayout } from '../components';
import { useAuthStore } from '../context/store';

const initialForm = {
  firstName: '',
  lastName: '',
  phone: '',
  profilePicture: ''
};

export default function StudentProfile() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [previewImage, setPreviewImage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const { setUser } = useAuthStore();

  const fullName = useMemo(() => {
    if (!profile) return '';
    return `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
  }, [profile]);

  const load = async () => {
    try {
      const [me, subs] = await Promise.all([getMyProfile(), getMySubmissions()]);
      setProfile(me);
      const formData = {
        firstName: me?.firstName || '',
        lastName: me?.lastName || '',
        phone: me?.phone || '',
        profilePicture: me?.profilePicture || ''
      };
      setForm(formData);
      setPreviewImage(me?.profilePicture || '');
      setSubmissions(subs);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load profile');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Convert to base64 and preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setPreviewImage(base64String);
      setForm((prev) => ({ ...prev, profilePicture: base64String }));
      toast.success('Image selected! Click "Save Profile" to update.');
    };
    reader.readAsDataURL(file);
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFileSelect(file);
  };

  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file);
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Remove profile picture
  const handleRemoveImage = () => {
    setPreviewImage('');
    setForm((prev) => ({ ...prev, profilePicture: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('Image removed. Click "Save Profile" to update.');
  };

  const onSave = async () => {
    setLoading(true);
    try {
      const payload = {
        firstName: form.firstName?.trim(),
        lastName: form.lastName?.trim(),
        phone: form.phone?.trim(),
        profilePicture: form.profilePicture?.trim(),
      };
      const res = await updateMyProfile(payload);
      if (res.success) {
        toast.success('✅ Profile updated successfully!');
        
        // Update the auth store and localStorage with new user data
        const updatedUser = res.data;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        await load();
      } else {
        toast.error(res.message || 'Update failed');
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardHeader 
              title={<Typography variant="h5" fontWeight="bold">My Profile</Typography>}
              subheader="Manage your student account" 
            />
            <CardContent>
              <Stack direction="column" alignItems="center" spacing={2}>
                {/* Profile Picture Upload Area */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Paper
                    elevation={0}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    sx={{
                      p: 3,
                      border: isDragging ? '3px dashed #16a34a' : '2px dashed #d1d5db',
                      borderRadius: 3,
                      textAlign: 'center',
                      cursor: 'pointer',
                      bgcolor: isDragging ? '#f0fdf4' : '#fafafa',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: '#f9fafb',
                        borderColor: '#16a34a',
                      }
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      style={{ display: 'none' }}
                    />
                    
                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                      <Avatar 
                        src={previewImage || form.profilePicture} 
                        sx={{ 
                          width: 120, 
                          height: 120,
                          border: '4px solid #16a34a',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          fontSize: '3rem',
                          fontWeight: 'bold',
                          bgcolor: '#16a34a'
                        }}
                      >
                        {fullName ? fullName[0].toUpperCase() : 'S'}
                      </Avatar>
                      
                      {previewImage && (
                        <IconButton
                          onClick={handleRemoveImage}
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: -10,
                            bgcolor: '#ef4444',
                            color: 'white',
                            width: 32,
                            height: 32,
                            '&:hover': {
                              bgcolor: '#dc2626',
                            }
                          }}
                        >
                          <Delete sx={{ fontSize: 16 }} />
                        </IconButton>
                      )}
                    </Box>

                    <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                      {fullName || 'Student'}
                    </Typography>
                    
                    {profile?.email && (
                      <Chip 
                        color="success" 
                        variant="outlined" 
                        label={profile.email}
                        size="small"
                        sx={{ mb: 2 }}
                      />
                    )}

                    <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<CloudUpload />}
                        onClick={handleUploadClick}
                        size="small"
                        sx={{
                          bgcolor: '#16a34a',
                          '&:hover': { bgcolor: '#15803d' }
                        }}
                      >
                        Upload
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<PhotoCamera />}
                        onClick={handleUploadClick}
                        size="small"
                        color="success"
                      >
                        Browse
                      </Button>
                    </Stack>

                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                      Drag & drop or click to upload
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      PNG, JPG up to 5MB
                    </Typography>
                  </Paper>
                </motion.div>
              </Stack>
              
              <Divider sx={{ my: 3 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="First Name" 
                    name="firstName" 
                    value={form.firstName} 
                    onChange={onChange} 
                    fullWidth 
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="Last Name" 
                    name="lastName" 
                    value={form.lastName} 
                    onChange={onChange} 
                    fullWidth 
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    label="Phone" 
                    name="phone" 
                    value={form.phone} 
                    onChange={onChange} 
                    fullWidth 
                    variant="outlined"
                    placeholder="+1 234 567 8900"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    onClick={onSave} 
                    variant="contained" 
                    fullWidth 
                    disabled={loading}
                    size="large"
                    sx={{
                      bgcolor: '#16a34a',
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      '&:hover': { bgcolor: '#15803d' },
                      '&:disabled': { bgcolor: '#d1d5db' }
                    }}
                  >
                    {loading ? 'Saving Profile...' : '💾 Save Profile'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card elevation={3}>
            <CardHeader 
              title={<Typography variant="h5" fontWeight="bold">Quiz History</Typography>}
              subheader="Your recent quiz attempts" 
            />
            <CardContent>
              {submissions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    📚 No Quiz History
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    You haven't attempted any quizzes yet. Start your learning journey!
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Quiz</TableCell>
                        <TableCell>Subject</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Score</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {submissions.map((s) => (
                        <TableRow key={s._id} hover>
                          <TableCell>{s.quiz?.title || '-'}</TableCell>
                          <TableCell>{s.quiz?.subject || '-'}</TableCell>
                          <TableCell>
                            <Chip size="small" label={s.status} color={s.status === 'graded' ? 'success' : s.status === 'submitted' ? 'info' : 'default'} />
                          </TableCell>
                          <TableCell>
                            {s.score != null && s.totalMarks != null ? `${s.score}/${s.totalMarks}` : '-'}
                          </TableCell>
                          <TableCell>{new Date(s.createdAt || s.updatedAt).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
    </MainLayout>
  );
}
