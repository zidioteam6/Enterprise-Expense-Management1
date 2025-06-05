import React, { useEffect, useState } from 'react';
import api from '../utils/axios';
import {
  Grid,
  Typography,
  Paper,
  Card,
  CardContent,
  IconButton,
  Modal,
  Box,
  AppBar,
  Toolbar,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PieChartIcon from '@mui/icons-material/PieChart';
import DownloadIcon from '@mui/icons-material/Download';
import HistoryIcon from '@mui/icons-material/History';
import NotificationsIcon from '@mui/icons-material/Notifications';
import UpdateIcon from '@mui/icons-material/Update';
import GroupIcon from '@mui/icons-material/Group';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import AddExpenseForm from './AddExpenseForm';
import ExpenseSummaryModal from './ExpenseSummaryModal';
import ApprovedExpensesModal from './ApprovedExpensesModal';
import AuditLogsModal from './AuditLogsModal';
import NotificationCenter from './NotificationCenter';
import { useNavigate } from 'react-router-dom';
import MonthlyBudgetSettings from './MonthlyBudgetSettings';
import ExpenseGraph from './ExpenseGraph';

const Dashboard = () => {
  const navigate = useNavigate();
  const [expenseData, setExpenseData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [approvedModalOpen, setApprovedModalOpen] = useState(false);
  const [auditLogsModalOpen, setAuditLogsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [stats, setStats] = useState({
    totalExpenses: 0,
    pendingApprovals: 0,
    approvedExpenses: 0,
    monthlyBudget: 0
  });
  const [budgetSettingsOpen, setBudgetSettingsOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    fetchExpenses();
    fetchMonthlyBudget();
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
    fetchProfileImage();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [expenseData]);

  const fetchMonthlyBudget = async () => {
    try {
      const response = await api.get('/settings/monthly-budget');
      setStats(prev => ({
        ...prev,
        monthlyBudget: response.data.budget || 50000 // Fallback to 50000 if not set
      }));
    } catch (error) {
      console.error('Error fetching monthly budget:', error);
      // Keep default budget if fetch fails
      setStats(prev => ({
        ...prev,
        monthlyBudget: 50000
      }));
    }
  };

  const calculateStats = () => {
    console.log('Calculating stats for expenses:', expenseData); // Debug log
    const total = expenseData.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
    
    // Count expenses by status
    const statusCounts = expenseData.reduce((acc, exp) => {
      const status = (exp.approval_status || '').toUpperCase();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('Status counts:', statusCounts); // Debug log

    setStats(prev => ({
      ...prev,
      totalExpenses: total,
      pendingApprovals: statusCounts['PENDING'] || 0,
      approvedExpenses: statusCounts['APPROVED'] || 0
    }));
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const fetchExpenses = async () => {
    try {
      const response = await api.get('/expenses');
      console.log('Raw expense data from API:', response.data); // Debug log
      const normalizedExpenses = response.data.map((expense) => ({
        ...expense,
        date: expense.date
          ? new Date(expense.date).toISOString().split('T')[0]
          : null,
        amount: parseFloat(expense.amount) || 0,
        category: expense.category || 'Unknown',
        description: expense.description || '',
        approval_status: expense.approvalStatus || 'PENDING', // Use approvalStatus from backend
      }));
      console.log('Normalized expenses:', normalizedExpenses); // Debug log
      setExpenseData(normalizedExpenses);
      setError('');
    } catch (error) {
      const errorMessage = error.response
        ? `API Error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`
        : `Network Error: ${error.message}`;
      setError(errorMessage);
      console.error('Error fetching expenses:', error);
    }
  };

  const handleAddExpense = (newExpense) => {
    setExpenseData((prev) => [...prev, newExpense]);
    fetchExpenses(); // Re-fetch to sync with database
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await api.get('/audit/logs');
      console.log('Fetched audit logs:', response.data);
    } catch (err) {
      setError('Failed to fetch audit logs: ' + (err.response ? err.response.data : err.message));
    }
  };

  const handleCardClick = (title) => {
    if (title === 'Create Expense') {
      setModalOpen(true);
    } else if (title === 'Expense Summary') {
      setSummaryModalOpen(true);
    } else if (title === 'Approve Expenses') {
      setApprovedModalOpen(true);
    } else if (title === 'Export Report') {
      // Export report logic
      api({
        url: '/expenses/export',
        method: 'GET',
        responseType: 'blob', // important
      })
        .then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'expenses_report.csv');
          document.body.appendChild(link);
          link.click();
          link.remove();
        })
        .catch((err) => {
          setError('Failed to export report: ' + (err.response ? err.response.data : err.message));
        });
    } else if (title === 'Audit Logs') {
      fetchAuditLogs();
      setAuditLogsModalOpen(true);
    }
  };

  const handleBudgetUpdate = (newBudget) => {
    setStats(prev => ({
      ...prev,
      monthlyBudget: newBudget
    }));
  };

  const fetchProfileImage = async () => {
    try {
      const response = await api.get('/auth/profile/image', {
        responseType: 'blob'
      });
      const imageUrl = URL.createObjectURL(response.data);
      setProfileImage(imageUrl);
    } catch (error) {
      console.error('Error fetching profile image:', error);
      // Don't set error state here as it's not critical
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setUploadError('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size should be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setUploadError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file first');
      return;
    }

    setUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await api.post('/auth/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Refresh the profile image
      await fetchProfileImage();
      setUploadDialogOpen(false);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading profile image:', error);
      setUploadError(error.response?.data?.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Professional Header */}
      <AppBar position="static" color="default" elevation={1} sx={{ backgroundColor: 'white' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#1976d2', fontWeight: 'bold' }}>
            Enterprise Expense Management
          </Typography>
          
          <NotificationCenter userId={currentUser?.id} />
          
          <IconButton
            onClick={handleProfileMenuOpen}
            sx={{ ml: 2 }}
            size="large"
          >
            <Avatar 
              sx={{ bgcolor: '#1976d2' }}
              src={profileImage}
            >
              {!profileImage && (currentUser?.username?.charAt(0)?.toUpperCase() || <PersonIcon />)}
            </Avatar>
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            PaperProps={{
              elevation: 3,
              sx: { width: 250, maxWidth: '100%' }
            }}
          >
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Avatar 
                sx={{ width: 64, height: 64, mx: 'auto', mb: 1, bgcolor: '#1976d2' }}
                src={profileImage}
              >
                {!profileImage && (currentUser?.username?.charAt(0)?.toUpperCase() || <PersonIcon />)}
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {currentUser?.username || 'User'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentUser?.role || 'Employee'}
              </Typography>
              <Button
                startIcon={<PhotoCameraIcon />}
                onClick={() => {
                  setUploadDialogOpen(true);
                  handleProfileMenuClose();
                }}
                sx={{ mt: 1 }}
                size="small"
              >
                Change Photo
              </Button>
            </Box>
            <Divider />
            <MenuItem onClick={handleProfileMenuClose}>
              <PersonIcon sx={{ mr: 2 }} /> Profile
            </MenuItem>
            <MenuItem onClick={handleProfileMenuClose}>
              <SettingsIcon sx={{ mr: 2 }} /> Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <LogoutIcon sx={{ mr: 2 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Profile Image Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)}>
        <DialogTitle>Upload Profile Photo</DialogTitle>
        <DialogContent>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="profile-image-upload"
            type="file"
            onChange={handleFileSelect}
          />
          <label htmlFor="profile-image-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<PhotoCameraIcon />}
              fullWidth
              sx={{ mb: 2 }}
            >
              Select Image
            </Button>
          </label>
          {selectedFile && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Selected: {selectedFile.name}
            </Typography>
          )}
          {uploadError && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {uploadError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            variant="contained"
          >
            {uploading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mt: 2, mb: 4 }}>
        {[
          {
            title: 'Total Expenses',
            value: `₹${stats.totalExpenses.toLocaleString()}`,
            icon: <ReceiptIcon />,
            color: '#1976d2'
          },
          {
            title: 'Pending Approvals',
            value: stats.pendingApprovals,
            icon: <CheckCircleIcon />,
            color: '#ff9800'
          },
          {
            title: 'Approved Expenses',
            value: stats.approvedExpenses,
            icon: <CheckCircleIcon />,
            color: '#4caf50'
          },
          {
            title: 'Monthly Budget',
            value: `₹${stats.monthlyBudget.toLocaleString()}`,
            icon: <PieChartIcon />,
            color: '#9c27b0',
            onClick: () => setBudgetSettingsOpen(true),
            actionIcon: <SettingsIcon sx={{ ml: 1, fontSize: '1rem' }} />,
            actionText: 'Click to update budget'
          }
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: stat.onClick ? 'pointer' : 'default',
                '&:hover': {
                  transform: stat.onClick ? 'translateY(-4px)' : 'none',
                  boxShadow: stat.onClick ? 3 : 1
                }
              }}
              onClick={stat.onClick}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: stat.color, mr: 2 }}>
                    {stat.icon}
                  </Avatar>
                  <Typography variant="h6" component="div" sx={{ flex: 1 }}>
                    {stat.title}
                  </Typography>
                  {stat.actionIcon && (
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                      {stat.actionIcon}
                    </Box>
                  )}
                </Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: stat.color }}>
                  {stat.value}
                </Typography>
                {stat.actionText && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    {stat.actionText}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Existing Dashboard Content */}
      <Typography variant="h4" className="dashboard-title" sx={{ mb: 4 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3} className="card-grid">
        {[
          { 
            title: 'Expense Summary', 
            icon: <ReceiptIcon fontSize="large" />,
            description: 'View and analyze your expense history'
          },
          { 
            title: 'Create Expense', 
            icon: <AddCircleIcon fontSize="large" />,
            description: 'Submit a new expense for approval'
          },
          { 
            title: 'Approve Expenses', 
            icon: <CheckCircleIcon fontSize="large" />,
            description: 'Review and approve pending expenses'
          },
          { 
            title: 'Analytics & Charts', 
            icon: <PieChartIcon fontSize="large" />,
            description: 'Visualize expense trends and patterns'
          },
          { 
            title: 'Export Report', 
            icon: <DownloadIcon fontSize="large" />,
            description: 'Download expense reports in CSV format'
          },
          { 
            title: 'Audit Logs', 
            icon: <HistoryIcon fontSize="large" />,
            description: 'View system activity and audit trail'
          },
        ].map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              className="feature-card"
              elevation={2}
              onClick={() => handleCardClick(feature.title)}
              sx={{
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
            >
              <CardContent className="card-content">
                <IconButton color="primary" sx={{ mb: 1 }}>{feature.icon}</IconButton>
                <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <ExpenseGraph 
        expenseData={expenseData} 
        monthlyBudget={stats.monthlyBudget}
      />

      {/* Add Expense Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: 500,
            bgcolor: 'white',
            boxShadow: 24,
            borderRadius: 2,
            p: 4,
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          <AddExpenseForm onAddExpense={handleAddExpense} closeForm={() => setModalOpen(false)} />
        </Box>
      </Modal>

      {/* Expense Summary Modal */}
      <ExpenseSummaryModal
        open={summaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        expenses={expenseData}
      />

      {/* Pending Expenses Modal */}
      <ApprovedExpensesModal
        open={approvedModalOpen}
        onClose={() => setApprovedModalOpen(false)}
        expenses={expenseData.filter(
          (e) =>
            !e.approval_status || e.approval_status.toUpperCase() === 'PENDING'
        )}
      />

      {/* Audit Logs Modal */}
      <AuditLogsModal open={auditLogsModalOpen} onClose={() => setAuditLogsModalOpen(false)} />

      {/* Add MonthlyBudgetSettings dialog */}
      <MonthlyBudgetSettings
        open={budgetSettingsOpen}
        onClose={() => setBudgetSettingsOpen(false)}
        onBudgetUpdate={handleBudgetUpdate}
      />
    </div>
  );
};

export default Dashboard;
