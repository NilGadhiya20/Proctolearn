import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components';
import { ResponsivePageLayout } from '../components/Layout/ResponsivePageLayout';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import QuizIcon from '@mui/icons-material/Quiz';
import toast from 'react-hot-toast';

const ViewReports = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [reports, setReports] = useState([
    { id: 1, quiz: 'Mathematics Quiz 1', participants: 45, avgScore: 78, completed: 42, date: '2025-12-25' },
    { id: 2, quiz: 'Science Quiz 2', participants: 38, avgScore: 82, completed: 35, date: '2025-12-20' },
    { id: 3, quiz: 'History Quiz 1', participants: 50, avgScore: 65, completed: 48, date: '2025-12-15' }
  ]);

  const stats = [
    { title: 'Total Quizzes', value: '12', icon: <QuizIcon sx={{ fontSize: 40 }} />, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { title: 'Total Participants', value: '133', icon: <PeopleIcon sx={{ fontSize: 40 }} />, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    { title: 'Avg Score', value: '75%', icon: <TrendingUpIcon sx={{ fontSize: 40 }} />, gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { title: 'Completion Rate', value: '94%', icon: <AssessmentIcon sx={{ fontSize: 40 }} />, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }
  ];

  // Helper: create a downloadable file from a Blob
  const triggerDownload = (blob, filename) => {
    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      // no-op; caller handles toast
    }
  };

  // Helper: escape CSV field
  const csvEscape = (value) => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    const needsQuotes = /[",\n]/.test(str);
    const escaped = str.replaceAll('"', '""');
    return needsQuotes ? `"${escaped}"` : escaped;
  };

  // Build CSV from report rows
  const buildCsv = (rows) => {
    const headers = [
      'Quiz Name',
      'Date',
      'Participants',
      'Completed',
      'Avg Score',
      'Completion Rate'
    ];

    const lines = [headers.join(',')];
    rows.forEach((r) => {
      const completionRate = Math.round((r.completed / r.participants) * 100);
      const line = [
        csvEscape(r.quiz),
        csvEscape(new Date(r.date).toLocaleDateString()),
        csvEscape(r.participants),
        csvEscape(r.completed),
        csvEscape(`${r.avgScore}%`),
        csvEscape(`${completionRate}%`)
      ].join(',');
      lines.push(line);
    });

    return lines.join('\n');
  };

  const handleDownloadAllReports = () => {
    try {
      const csv = buildCsv(reports);
      const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
      const filename = `quiz_reports_${new Date().toISOString().slice(0,10)}.csv`;
      triggerDownload(blob, filename);
      toast.success('Report downloaded successfully.');
    } catch (err) {
      toast.error('Failed to download report.');
    }
  };

  const handleDownloadSingleReport = (report) => {
    try {
      const csv = buildCsv([report]);
      const safeName = report.quiz.replace(/[^a-z0-9\-\_]+/gi, '_').toLowerCase();
      const filename = `${safeName || 'report'}_${new Date(report.date).toISOString().slice(0,10)}.csv`;
      const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
      triggerDownload(blob, filename);
      toast.success('Report downloaded successfully.');
    } catch (err) {
      toast.error('Failed to download report.');
    }
  };

  return (
    <MainLayout>
      <ResponsivePageLayout maxWidth="xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', py: { xs: 2, sm: 3, md: 4 } }}>
          <Container maxWidth="xl">
            {/* Header */}
            <Box sx={{ mb: { xs: 2, sm: 3, md: 4 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#1e293b', mb: 0.5, fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem', lg: '2.5rem' } }}>
                  Reports & Analytics
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>
                  View performance analytics and generate reports
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadAllReports}
                  sx={{ 
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    textTransform: 'none',
                    fontWeight: 600,
                    minHeight: '44px',
                    fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' }
                  }}
                >
                  Download Report
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate(-1)}
                  sx={{ borderRadius: 2, minHeight: '44px', fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' } }}
                >
                  Back
                </Button>
              </Box>
            </Box>

            {/* Statistics */}
            <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
              {stats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card sx={{ 
                    borderRadius: 3,
                    background: stat.gradient,
                    color: 'white',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}>
                    <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2, p: 1.5 }}>
                          {stat.icon}
                        </Box>
                      </Box>
                      <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem', lg: '2.5rem' } }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>
                        {stat.title}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Reports Table */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: '#1e293b', mb: 3, fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem', lg: '2.5rem' } }}>
                  Quiz Performance Reports
                </Typography>
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}><strong>Quiz Name</strong></TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}><strong>Date</strong></TableCell>
                        <TableCell align="center" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}><strong>Participants</strong></TableCell>
                        <TableCell align="center" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}><strong>Completed</strong></TableCell>
                        <TableCell align="center" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}><strong>Avg Score</strong></TableCell>
                        <TableCell align="center" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}><strong>Completion Rate</strong></TableCell>
                        <TableCell align="right" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reports.map((report) => {
                        const completionRate = Math.round((report.completed / report.participants) * 100);
                        return (
                          <TableRow key={report.id} hover>
                            <TableCell sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>
                              <Typography variant="body2" fontWeight="600">
                                {report.quiz}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>{new Date(report.date).toLocaleDateString()}</TableCell>
                            <TableCell align="center" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>{report.participants}</TableCell>
                            <TableCell align="center" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>{report.completed}</TableCell>
                            <TableCell align="center" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>
                              <Chip 
                                label={`${report.avgScore}%`}
                                color={report.avgScore >= 70 ? 'success' : report.avgScore >= 50 ? 'warning' : 'error'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ flex: 1 }}>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={completionRate} 
                                    sx={{ height: 6, borderRadius: 3 }}
                                  />
                                </Box>
                                <Typography variant="caption" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>{completionRate}%</Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="right" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>
                              <Button 
                                size="small" 
                                startIcon={<DownloadIcon />}
                                onClick={() => handleDownloadSingleReport(report)}
                                sx={{ textTransform: 'none', minHeight: '44px', fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' } }}
                              >
                                Export
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Container>
        </Box>
      </motion.div>
    </ResponsivePageLayout>
    </MainLayout>
  );
};

export default ViewReports;
