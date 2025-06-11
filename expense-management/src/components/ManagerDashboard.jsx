import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Chip,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  Alert,
  Snackbar,
  LinearProgress,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Badge,
  CardActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  CircularProgress,
  Fab,
  Zoom,
  Fade,
  Slide,
  Grow,
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Slider,
  Rating,
  Autocomplete,
  Pagination,
  Stack,
  Breadcrumbs,
  Link as MuiLink,
  AppBar,
  Toolbar,
  Drawer,
  ListItemIcon,
  ListItemButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Comment as CommentIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Group as TeamIcon,
  Assessment as ReportIcon,
  Send as SubmitIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  ViewList as ListIcon,
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as FinanceIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Receipt as ReceiptIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FileDownload as ExportIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Favorite as FavoriteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Flag as FlagIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  Block as BlockIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  MoreVert as MoreIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowLeft as ArrowLeftIcon,
  KeyboardArrowRight as ArrowRightIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart, Legend } from 'recharts';
import api from '../utils/axios';

const ManagerDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State management
  const [expenses, setExpenses] = useState([]);
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [commentDialog, setCommentDialog] = useState({ open: false, expense: null });
  const [comment, setComment] = useState('');
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAmount, setFilterAmount] = useState([0, 50000]);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    totalPending: 0,
    totalApproved: 0,
    totalRejected: 0,
    teamExpenses: 0,
    monthlyBudget: 50000,
    budgetUsed: 0,
    averageApprovalTime: 0,
    teamSize: 0
  });

  // Chart data
  const [chartData, setChartData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [approvalTrends, setApprovalTrends] = useState([]);

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchExpenses(),
        fetchTeamData(),
        fetchStats(),
        fetchChartData(),
        fetchNotifications()
      ]);
    } catch (err) {
      setError('Failed to fetch data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await api.get('/expenses/by-approval-status');
      const { approved, notApproved } = response.data;
      
      const allExpenses = [...approved, ...notApproved];
      setExpenses(allExpenses);
      
      // Filter pending expenses for manager approval
      const pending = notApproved.filter(exp => 
        exp.approvalStatus === 'PENDING' && 
        exp.currentApprovalStage === 'PENDING_MANAGER'
      );
      setPendingExpenses(pending);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      throw err;
    }
  };

  const fetchTeamData = async () => {
    try {
      // ✅ Fetch all employees from backend (no manager filtering)
      const response = await api.get('/api/team/members');
      setTeamMembers(response.data);
    } catch (err) {
      console.error('Error fetching team data:', err);
      // Fallback to empty array if API fails
      setTeamMembers([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/expenses/total');
      const totalAmount = response.data || 0;
      
      const newStats = {
        totalPending: pendingExpenses.length,
        totalApproved: expenses.filter(exp => exp.approvalStatus === 'APPROVED').length,
        totalRejected: expenses.filter(exp => exp.approvalStatus === 'REJECTED').length,
        teamExpenses: totalAmount,
        monthlyBudget: 50000,
        budgetUsed: (totalAmount / 50000) * 100,
        averageApprovalTime: 2.5, // days
        teamSize: teamMembers.length
      };
      setStats(newStats);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchChartData = async () => {
    // Mock chart data - replace with actual API calls
    const monthlyData = [
      { month: 'Jan', approved: 12, pending: 5, rejected: 2 },
      { month: 'Feb', approved: 15, pending: 3, rejected: 1 },
      { month: 'Mar', approved: 18, pending: 7, rejected: 3 },
      { month: 'Apr', approved: 14, pending: 4, rejected: 2 },
      { month: 'May', approved: 20, pending: 6, rejected: 1 },
      { month: 'Jun', approved: 16, pending: 5, rejected: 2 }
    ];
    setChartData(monthlyData);

    const categoryData = [
      { name: 'Travel', value: 35, color: '#8884d8' },
      { name: 'Meals', value: 25, color: '#82ca9d' },
      { name: 'Office Supplies', value: 20, color: '#ffc658' },
      { name: 'Software', value: 15, color: '#ff7300' },
      { name: 'Other', value: 5, color: '#00ff00' }
    ];
    setCategoryData(categoryData);

    const approvalTrends = [
      { day: 'Mon', time: 1.2 },
      { day: 'Tue', time: 1.8 },
      { day: 'Wed', time: 2.1 },
      { day: 'Thu', time: 1.5 },
      { day: 'Fri', time: 2.3 },
      { day: 'Sat', time: 3.0 },
      { day: 'Sun', time: 2.8 }
    ];
    setApprovalTrends(approvalTrends);
  };

  const fetchNotifications = async () => {
    // Mock notifications
    const mockNotifications = [
      { id: 1, type: 'approval', message: 'New expense requires approval', time: '2 min ago', read: false },
      { id: 2, type: 'budget', message: 'Team budget 80% used', time: '1 hour ago', read: false },
      { id: 3, type: 'system', message: 'System maintenance scheduled', time: '2 hours ago', read: true }
    ];
    setNotifications(mockNotifications);
  };

  // Handle expense approval/rejection
  const handleExpenseAction = async (expenseId, action, comment = '') => {
    try {
      await api.put(`/api/expenses/${expenseId}/${action.toLowerCase()}`, { comment });
      setSuccess(`Expense ${action.toLowerCase()}d successfully`);
      fetchAllData(); // Refresh all data
    } catch (err) {
      setError(`Failed to ${action.toLowerCase()} expense: ${err.message}`);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action) => {
    try {
      const promises = selectedExpenses.map(expenseId => 
        api.put(`/api/expenses/${expenseId}/${action.toLowerCase()}`, { comment })
      );
      await Promise.all(promises);
      setSuccess(`Bulk ${action.toLowerCase()} completed for ${selectedExpenses.length} expenses`);
      setSelectedExpenses([]);
      fetchAllData();
    } catch (err) {
      setError(`Bulk ${action.toLowerCase()} failed: ${err.message}`);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async () => {
    if (!comment.trim()) return;
    
    try {
      if (commentDialog.expense?.id === 'bulk') {
        // Add comment to all selected expenses
        const promises = selectedExpenses.map(expenseId => 
          api.post(`/api/expenses/${expenseId}/comment`, { comment })
        );
        await Promise.all(promises);
        setSuccess(`Comment added to ${selectedExpenses.length} expenses`);
      } else {
        // Add comment to single expense
        await api.post(`/api/expenses/${commentDialog.expense.id}/comment`, { comment });
        setSuccess('Comment added successfully');
      }
      setComment('');
      setCommentDialog({ open: false, expense: null });
      fetchAllData();
    } catch (err) {
      setError('Failed to add comment: ' + err.message);
    }
  };

  // Filter and sort expenses
  const filteredExpenses = pendingExpenses.filter(expense => {
    const matchesSearch = expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.employeeName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || expense.approvalStatus === filterStatus;
    const matchesAmount = expense.amount >= filterAmount[0] && expense.amount <= filterAmount[1];
    
    return matchesSearch && matchesStatus && matchesAmount;
  }).sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'amount':
        comparison = a.amount - b.amount;
        break;
      case 'date':
        comparison = new Date(a.date) - new Date(b.date);
        break;
      case 'employee':
        comparison = (a.employeeName || '').localeCompare(b.employeeName || '');
        break;
      default:
        comparison = 0;
    }
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  // Pagination
  const paginatedExpenses = filteredExpenses.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Render expense table
  const renderExpenseTable = () => (
    <TableContainer component={Paper} elevation={2}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
            <TableCell padding="checkbox">
              <Checkbox
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedExpenses(filteredExpenses.map(exp => exp.id));
                  } else {
                    setSelectedExpenses([]);
                  }
                }}
                checked={selectedExpenses.length === filteredExpenses.length && filteredExpenses.length > 0}
                indeterminate={selectedExpenses.length > 0 && selectedExpenses.length < filteredExpenses.length}
              />
            </TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Employee</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Category</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Amount</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedExpenses.map((expense) => (
            <TableRow key={expense.id} hover>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedExpenses.includes(expense.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedExpenses([...selectedExpenses, expense.id]);
                    } else {
                      setSelectedExpenses(selectedExpenses.filter(id => id !== expense.id));
                    }
                  }}
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: theme.palette.primary.main }}>
                    {expense.employeeName?.charAt(0) || 'U'}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {expense.employeeName || 'Unknown'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {expense.employeeId}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {new Date(expense.date).toLocaleDateString()}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip 
                  label={expense.category} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight="bold" color="primary">
                  ₹{parseFloat(expense.amount).toLocaleString()}
                </Typography>
              </TableCell>
              <TableCell>
                <Tooltip title={expense.description || 'No description'}>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                    {expense.description || 'No description'}
                  </Typography>
                </Tooltip>
              </TableCell>
              <TableCell>
                <Chip
                  label={expense.approvalStatus}
                  color={
                    expense.approvalStatus === 'APPROVED' ? 'success' :
                    expense.approvalStatus === 'REJECTED' ? 'error' :
                    'warning'
                  }
                  size="small"
                  icon={
                    expense.approvalStatus === 'APPROVED' ? <CheckIcon /> :
                    expense.approvalStatus === 'REJECTED' ? <CloseIcon /> :
                    <InfoIcon />
                  }
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Approve">
                    <IconButton
                      size="small"
                      color="success"
                      onClick={() => handleExpenseAction(expense.id, 'approve')}
                    >
                      <ApproveIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reject">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleExpenseAction(expense.id, 'reject')}
                    >
                      <RejectIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Add Comment">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => setCommentDialog({ open: true, expense })}
                    >
                      <CommentIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => {/* View expense details */}}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Render team overview
  const renderTeamOverview = () => (
    <Grid container spacing={3}>
      {teamMembers.map((member) => (
        <Grid item xs={12} sm={6} md={4} key={member.id}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ width: 48, height: 48, mr: 2, bgcolor: theme.palette.secondary.main }}>
                  {member.avatar}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight="bold">
                    {member.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {member.role} • {member.department}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Total Expenses: <strong>₹{member.totalExpenses.toLocaleString()}</strong>
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Pending Claims: <strong>{member.pendingClaims}</strong>
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(member.totalExpenses / stats.monthlyBudget) * 100}
                  sx={{ mt: 1 }}
                />
              </Box>
              
              <CardActions>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ReportIcon />}
                  onClick={() => {/* View detailed report */}}
                >
                  View Report
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PersonIcon />}
                  onClick={() => {/* View profile */}}
                >
                  Profile
                </Button>
              </CardActions>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // Render analytics charts
  const renderAnalytics = () => (
    <Grid container spacing={3}>
      {/* Monthly Trends */}
      <Grid item xs={12} md={8}>
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Monthly Expense Trends
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="approved" fill="#4caf50" name="Approved" />
                <Bar dataKey="pending" fill="#ff9800" name="Pending" />
                <Bar dataKey="rejected" fill="#f44336" name="Rejected" />
                <Line type="monotone" dataKey="approved" stroke="#2e7d32" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Category Distribution */}
      <Grid item xs={12} md={4}>
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Expense Categories
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Approval Time Trends */}
      <Grid item xs={12}>
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Approval Time Trends (Days)
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={approvalTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <RechartsTooltip />
                <Line type="monotone" dataKey="time" stroke="#2196f3" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 3, mb: 3, backgroundColor: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="primary">
              Manager Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage team expenses and approvals
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchAllData}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => {/* Export data */}}
            >
              Export
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ backgroundColor: '#e3f2fd' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <SpeedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      {stats.totalPending}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Approvals
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ backgroundColor: '#e8f5e8' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <CheckIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {stats.totalApproved}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Approved This Month
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ backgroundColor: '#fff3e0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                    <MoneyIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                      ₹{stats.teamExpenses.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Team Expenses
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ backgroundColor: '#fce4ec' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                    <WarningIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color="error.main">
                      {stats.totalRejected}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Rejected This Month
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Content */}
      <Paper elevation={1} sx={{ p: 2, backgroundColor: 'white' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Pending Approvals" />
            <Tab label="Team Overview" />
            <Tab label="Analytics" />
            <Tab label="Reports" />
          </Tabs>
        </Box>

        {/* Bulk Actions */}
        {selectedExpenses.length > 0 && (
          <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Bulk Actions ({selectedExpenses.length} selected)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<ApproveIcon />}
                onClick={() => handleBulkAction('APPROVE')}
              >
                Approve Selected
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<RejectIcon />}
                onClick={() => handleBulkAction('REJECT')}
              >
                Reject Selected
              </Button>
              <Button
                variant="outlined"
                startIcon={<CommentIcon />}
                onClick={() => setCommentDialog({ open: true, expense: { id: 'bulk' } })}
              >
                Add Comment
              </Button>
              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                onClick={() => {/* Export selected */}}
              >
                Export Selected
              </Button>
            </Box>
          </Box>
        )}

        {/* Tab Content */}
        {activeTab === 0 && (
          <Box>
            {/* Filters and Search */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', flex: 1 }}>
                <TextField
                  size="small"
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ minWidth: 250 }}
                />
                
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="APPROVED">Approved</MenuItem>
                    <MenuItem value="REJECTED">Rejected</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    label="Sort By"
                  >
                    <MenuItem value="date">Date</MenuItem>
                    <MenuItem value="amount">Amount</MenuItem>
                    <MenuItem value="employee">Employee</MenuItem>
                  </Select>
                </FormControl>

                <IconButton onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                  {sortOrder === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />}
                </IconButton>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={(e) => setFilterAnchor(e.currentTarget)}
                >
                  Filters
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => {/* Export all */}}
                >
                  Export All
                </Button>
              </Box>
            </Box>

            {/* Expense Table */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {renderExpenseTable()}
                
                {/* Pagination */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, filteredExpenses.length)} of {filteredExpenses.length} expenses
                  </Typography>
                  <Pagination
                    count={Math.ceil(filteredExpenses.length / rowsPerPage)}
                    page={page + 1}
                    onChange={(e, newPage) => setPage(newPage - 1)}
                    color="primary"
                  />
                </Box>
              </>
            )}
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Team Overview
            </Typography>
            {renderTeamOverview()}
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Analytics & Insights
            </Typography>
            {renderAnalytics()}
          </Box>
        )}

        {activeTab === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Reports & Exports
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Generate Reports
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon><ReportIcon /></ListItemIcon>
                        <ListItemText primary="Monthly Expense Report" secondary="Generate comprehensive monthly report" />
                        <Button variant="outlined" size="small">Generate</Button>
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><TeamIcon /></ListItemIcon>
                        <ListItemText primary="Team Performance Report" secondary="Team-wise expense analysis" />
                        <Button variant="outlined" size="small">Generate</Button>
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><TrendingUpIcon /></ListItemIcon>
                        <ListItemText primary="Approval Trends Report" secondary="Approval time and patterns analysis" />
                        <Button variant="outlined" size="small">Generate</Button>
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Quick Actions
                    </Typography>
                    <Stack spacing={2}>
                      <Button variant="contained" startIcon={<DownloadIcon />} fullWidth>
                        Export All Expenses
                      </Button>
                      <Button variant="contained" startIcon={<PrintIcon />} fullWidth>
                        Print Summary
                      </Button>
                      <Button variant="contained" startIcon={<ShareIcon />} fullWidth>
                        Share Dashboard
                      </Button>
                      <Button variant="outlined" startIcon={<SettingsIcon />} fullWidth>
                        Dashboard Settings
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Comment Dialog */}
      <Dialog open={commentDialog.open} onClose={() => setCommentDialog({ open: false, expense: null })} maxWidth="sm" fullWidth>
        <DialogTitle>
          {commentDialog.expense?.id === 'bulk' ? 'Add Comment to Selected Expenses' : 'Add Comment'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Comment"
            fullWidth
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Enter your comment here..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialog({ open: false, expense: null })}>
            Cancel
          </Button>
          <Button onClick={handleCommentSubmit} variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchor}
        open={Boolean(filterAnchor)}
        onClose={() => setFilterAnchor(null)}
      >
        <MenuItem onClick={() => {/* Apply date filter */}}>
          <CalendarIcon sx={{ mr: 1 }} />
          Filter by Date
        </MenuItem>
        <MenuItem onClick={() => {/* Apply amount filter */}}>
          <MoneyIcon sx={{ mr: 1 }} />
          Filter by Amount
        </MenuItem>
        <MenuItem onClick={() => {/* Apply category filter */}}>
          <ReceiptIcon sx={{ mr: 1 }} />
          Filter by Category
        </MenuItem>
        <MenuItem onClick={() => {/* Apply employee filter */}}>
          <PersonIcon sx={{ mr: 1 }} />
          Filter by Employee
        </MenuItem>
      </Menu>

      {/* Notifications */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>

      {/* Loading Indicator */}
      {loading && (
        <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }} />
      )}

      {/* Floating Action Button */}
      <Zoom in={true}>
        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => {/* Quick add expense */}}
        >
          <AddIcon />
        </Fab>
      </Zoom>
    </Box>
  );
};

export default ManagerDashboard; 