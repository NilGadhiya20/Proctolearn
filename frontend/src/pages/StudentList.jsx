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
  Grid,
  Alert,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Divider,
  LinearProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import SchoolIcon from '@mui/icons-material/School';
import DateRangeIcon from '@mui/icons-material/DateRange';
import toast from 'react-hot-toast';
import api from '../services/api';
import AnimatedLoader from '../components/Common/AnimatedLoader';

const StudentList = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/users');
      console.log('📊 Fetch students response:', response.data);
      
      if (response.data.success) {
        // Filter only students
        const studentList = (response.data.data || []).filter(
          user => user.role === 'student'
        );
        setStudents(studentList);
      }
    } catch (error) {
      console.error('❌ Error fetching students:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleExpandRow = (studentId) => {
    if (expandedStudentId === studentId) {
      setExpandedStudentId(null);
      setSelectedStudent(null);
    } else {
      setExpandedStudentId(studentId);
      const student = students.find(s => s._id === studentId);
      setSelectedStudent(student);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      (student.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (student.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (student.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (student.enrollmentNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <AnimatedLoader message="Loading students" size="large" />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            📚 Student Management
          </Typography>
          <Typography variant="body2" color="textSecondary">
            View and manage all students. Click on a student to see detailed information.
          </Typography>
        </Box>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Typography color="inherit" sx={{ opacity: 0.8, mb: 1 }}>
                Total Students
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {students.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Typography color="inherit" sx={{ opacity: 0.8, mb: 1 }}>
                Active Today
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {students.filter(s => s.status === 'active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter */}
      <Card sx={{ mb: 4, p: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row' }}>
          <Box sx={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              Search Students
            </label>
            <input
              type="text"
              placeholder="Search by name, email, or enrollment number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            />
          </Box>
        </Box>
      </Card>

      {/* Students Table */}
      {filteredStudents.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="textSecondary">
              No students found
            </Typography>
            {searchTerm && (
              <Button
                onClick={() => setSearchTerm('')}
                sx={{ mt: 2 }}
              >
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: '8px', overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: '30px' }}></TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                {!isMobile && <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>}
                {!isTablet && <TableCell sx={{ fontWeight: 700 }}>Enrollment No.</TableCell>}
                {!isTablet && <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>}
                <TableCell sx={{ fontWeight: 700, textAlign: 'center', width: '50px' }}>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.map((student) => (
                <React.Fragment key={student._id}>
                  {/* Main Row */}
                  <TableRow
                    onClick={() => handleExpandRow(student._id)}
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: expandedStudentId === student._id ? theme.palette.action.hover : 'transparent',
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover
                      },
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <TableCell>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          fontSize: '12px',
                          fontWeight: 600
                        }}
                      >
                        {getInitials(student.firstName, student.lastName)}
                      </Avatar>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {student.firstName} {student.lastName}
                    </TableCell>
                    {!isMobile && (
                      <TableCell sx={{ color: 'textSecondary', fontSize: '14px' }}>
                        {student.email}
                      </TableCell>
                    )}
                    {!isTablet && (
                      <TableCell sx={{ color: 'textSecondary', fontSize: '14px' }}>
                        {student.enrollmentNumber || 'N/A'}
                      </TableCell>
                    )}
                    {!isTablet && (
                      <TableCell>
                        <Chip
                          label={student.status || 'Active'}
                          color={getStatusColor(student.status)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                    )}
                    <TableCell sx={{ textAlign: 'center' }}>
                      {expandedStudentId === student._id ? (
                        <ExpandLessIcon sx={{ color: 'primary.main' }} />
                      ) : (
                        <ExpandMoreIcon sx={{ color: 'textSecondary' }} />
                      )}
                    </TableCell>
                  </TableRow>

                  {/* Expanded Details Row */}
                  {expandedStudentId === student._id && (
                    <TableRow sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#262626' : '#fafafa' }}>
                      <TableCell colSpan={6} sx={{ p: 0 }}>
                        <Box sx={{ p: 4 }}>
                          <Grid container spacing={4}>
                            {/* Left Section - Avatar and Basic Info */}
                            <Grid item xs={12} md={4}>
                              <Box sx={{ textAlign: 'center', mb: 3 }}>
                                <Avatar
                                  sx={{
                                    width: 100,
                                    height: 100,
                                    margin: '0 auto 16px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    fontSize: '36px',
                                    fontWeight: 700
                                  }}
                                >
                                  {getInitials(student.firstName, student.lastName)}
                                </Avatar>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                  {student.firstName} {student.lastName}
                                </Typography>
                                <Chip
                                  label={student.status || 'Active'}
                                  color={getStatusColor(student.status)}
                                  sx={{ mb: 2 }}
                                />
                                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                                  Student Account
                                </Typography>
                              </Box>

                              <Divider sx={{ my: 2 }} />

                              {/* Quick Stats */}
                              <Box sx={{ mt: 3 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                                  Account Activity
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, fontSize: '12px' }}>
                                  <Typography variant="body2">
                                    <strong>Joined:</strong> {new Date(student.createdAt).toLocaleDateString()}
                                  </Typography>
                                  <Typography variant="body2">
                                    <strong>Last Updated:</strong> {new Date(student.updatedAt).toLocaleDateString()}
                                  </Typography>
                                  <Typography variant="body2">
                                    <strong>Account ID:</strong> {student._id.substring(0, 8)}...
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>

                            {/* Right Section - Detailed Information */}
                            <Grid item xs={12} md={8}>
                              <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                                  Student Information
                                </Typography>

                                {/* Information Grid */}
                                <Grid container spacing={3}>
                                  {/* First Name */}
                                  <Grid item xs={12} sm={6}>
                                    <Box sx={{ 
                                      p: 2, 
                                      backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
                                      borderRadius: '6px'
                                    }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <PersonIcon sx={{ fontSize: '18px', color: 'primary.main' }} />
                                        <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.7 }}>
                                          First Name
                                        </Typography>
                                      </Box>
                                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {student.firstName}
                                      </Typography>
                                    </Box>
                                  </Grid>

                                  {/* Last Name */}
                                  <Grid item xs={12} sm={6}>
                                    <Box sx={{ 
                                      p: 2, 
                                      backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
                                      borderRadius: '6px'
                                    }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <PersonIcon sx={{ fontSize: '18px', color: 'primary.main' }} />
                                        <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.7 }}>
                                          Last Name
                                        </Typography>
                                      </Box>
                                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {student.lastName}
                                      </Typography>
                                    </Box>
                                  </Grid>

                                  {/* Email */}
                                  <Grid item xs={12}>
                                    <Box sx={{ 
                                      p: 2, 
                                      backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
                                      borderRadius: '6px'
                                    }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <EmailIcon sx={{ fontSize: '18px', color: 'primary.main' }} />
                                        <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.7 }}>
                                          Email Address
                                        </Typography>
                                      </Box>
                                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {student.email}
                                      </Typography>
                                    </Box>
                                  </Grid>

                                  {/* Enrollment Number */}
                                  <Grid item xs={12} sm={6}>
                                    <Box sx={{ 
                                      p: 2, 
                                      backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
                                      borderRadius: '6px'
                                    }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <BadgeIcon sx={{ fontSize: '18px', color: 'primary.main' }} />
                                        <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.7 }}>
                                          Enrollment Number
                                        </Typography>
                                      </Box>
                                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {student.enrollmentNumber || 'Not assigned'}
                                      </Typography>
                                    </Box>
                                  </Grid>

                                  {/* Role */}
                                  <Grid item xs={12} sm={6}>
                                    <Box sx={{ 
                                      p: 2, 
                                      backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
                                      borderRadius: '6px'
                                    }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <SchoolIcon sx={{ fontSize: '18px', color: 'primary.main' }} />
                                        <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.7 }}>
                                          Role
                                        </Typography>
                                      </Box>
                                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {student.role}
                                      </Typography>
                                    </Box>
                                  </Grid>

                                  {/* Account Status */}
                                  <Grid item xs={12} sm={6}>
                                    <Box sx={{ 
                                      p: 2, 
                                      backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
                                      borderRadius: '6px'
                                    }}>
                                      <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.7, display: 'block', mb: 1 }}>
                                        Account Status
                                      </Typography>
                                      <Box>
                                        <Chip
                                          label={student.status || 'Active'}
                                          color={getStatusColor(student.status)}
                                        />
                                      </Box>
                                    </Box>
                                  </Grid>

                                  {/* Joined Date */}
                                  <Grid item xs={12} sm={6}>
                                    <Box sx={{ 
                                      p: 2, 
                                      backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
                                      borderRadius: '6px'
                                    }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <DateRangeIcon sx={{ fontSize: '18px', color: 'primary.main' }} />
                                        <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.7 }}>
                                          Joined Date
                                        </Typography>
                                      </Box>
                                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {new Date(student.createdAt).toLocaleDateString('en-US', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric'
                                        })}
                                      </Typography>
                                    </Box>
                                  </Grid>
                                </Grid>

                                {/* Action Buttons */}
                                <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => toast.success(`View profile for ${student.firstName}`)}
                                  >
                                    View Profile
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => toast.success(`View submissions for ${student.firstName}`)}
                                  >
                                    Quiz Submissions
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => toast.success(`View activity for ${student.firstName}`)}
                                  >
                                    Activity Log
                                  </Button>
                                </Box>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Footer Info */}
      <Box sx={{ mt: 4, p: 2, backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5', borderRadius: '6px' }}>
        <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center' }}>
          Showing {filteredStudents.length} of {students.length} students
          {searchTerm && ` • Search: "${searchTerm}"`}
        </Typography>
      </Box>
    </Container>
  );
};

export default StudentList;
