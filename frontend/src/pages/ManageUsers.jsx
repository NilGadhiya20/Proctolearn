import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Avatar,
  Grid,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ResponsivePageLayout } from '../components/Layout/ResponsivePageLayout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import toast from 'react-hot-toast';
import api from '../services/api';

const ManageUsers = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'student',
    password: '',
    enrollmentNumber: ''
  });
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'student'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/users');
      console.log('📊 Fetch users response:', response.data);
      if (response.data.success) {
        setUsers(response.data.data || []);
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      console.error('❌ Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      // Add institutionCode to formData
      const userData = {
        ...formData,
        institutionCode: 'DEFAULT'
      };
      
      console.log('👤 Creating user with data:', userData);
      const response = await api.post('/auth/register', userData);
      console.log('✅ User created response:', response.data);
      
      if (response.data.success) {
        toast.success('User created successfully!');
        setOpenDialog(false);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          role: 'student',
          password: '',
          enrollmentNumber: ''
        });
        fetchUsers();
      }
    } catch (error) {
      console.error('❌ Error creating user:', error);
      console.error('❌ Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/auth/users/${userId}`);
        toast.success('User deleted successfully!');
        fetchUsers();
      } catch (error) {
        console.error('❌ Error deleting user:', error);
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    });
    setOpenEditDialog(true);
  };

  const handleUpdateUser = async () => {
    try {
      console.log('Updating user:', selectedUser._id, editData);
      const response = await api.put(`/auth/users/${selectedUser._id}`, editData);
      if (response.data.success) {
        toast.success('User updated successfully!');
        setOpenEditDialog(false);
        fetchUsers();
      }
    } catch (error) {
      console.error('❌ Error updating user:', error);
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'error',
      faculty: 'primary',
      student: 'success'
    };
    return colors[role] || 'default';
  };

  const statCards = [
    { title: 'Total Users', value: users.length, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { title: 'Students', value: users.filter(u => u.role === 'student').length, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    { title: 'Faculty Members', value: users.filter(u => u.role === 'faculty').length, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }
  ];

  return (
    <ResponsivePageLayout maxWidth="xl">
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', py: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header */}
        <Box sx={{ mb: { xs: 2, sm: 3, md: 4 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: { xs: 1, sm: 2 } }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ 
              color: '#1e293b', 
              mb: 0.5,
              fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem', lg: '2.5rem' }
            }}>
              User Management
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
              Create and manage users across your institution
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              sx={{ 
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Add User
            </Button>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
              sx={{ borderRadius: 2 }}
            >
              Back
            </Button>
          </Box>
        </Box>

        {/* Statistics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ 
                borderRadius: 3,
                background: stat.gradient,
                color: 'white',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <CardContent>
                  <Typography variant="h3" fontWeight="bold">{stat.value}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>{stat.title}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Users Table */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: '#1e293b', mb: 3 }}>
              All Users
            </Typography>
            
            {loading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography>Loading users...</Typography>
              </Box>
            ) : users.length === 0 ? (
              <Alert severity="info">No users found. Create your first user!</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f0f2f5' }}>
                      <TableCell><strong>Name</strong></TableCell>
                      <TableCell><strong>Email</strong></TableCell>
                      <TableCell><strong>Role</strong></TableCell>
                      <TableCell><strong>Institution</strong></TableCell>
                      <TableCell><strong>Enrollment</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell align="right"><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user._id} hover sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: '#667eea', width: 36, height: 36 }}>
                              {user.firstName?.[0]}{user.lastName?.[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="600">
                                {user.firstName} {user.lastName}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{user.email}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={user.role?.toUpperCase()} 
                            color={getRoleColor(user.role)}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {user.institution?.code || user.institution?.name || 'DEFAULT'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {user.enrollmentNumber || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={user.isActive ? 'Active' : 'Inactive'} 
                            color={user.isActive ? 'success' : 'default'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleEditUser(user)}
                            title="Edit user"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteUser(user._id)}
                            title="Delete user"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Create User Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Typography variant="h6" fontWeight="bold">Create New User</Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <TextField
                select
                fullWidth
                label="Role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="faculty">Faculty</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </TextField>
              {formData.role === 'student' && (
                <TextField
                  fullWidth
                  label="Enrollment Number"
                  value={formData.enrollmentNumber}
                  onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value })}
                />
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleCreateUser}
              sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                textTransform: 'none'
              }}
            >
              Create User
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Typography variant="h6" fontWeight="bold">Edit User</Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                fullWidth
                label="First Name"
                value={editData.firstName}
                onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
              />
              <TextField
                fullWidth
                label="Last Name"
                value={editData.lastName}
                onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={editData.email}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                disabled
                helperText="Email cannot be changed"
              />
              <TextField
                select
                fullWidth
                label="Role"
                value={editData.role}
                onChange={(e) => setEditData({ ...editData, role: e.target.value })}
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="faculty">Faculty</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleUpdateUser}
              sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                textTransform: 'none'
              }}
            >
              Update User
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ResponsivePageLayout>
  );
};

export default ManageUsers;
