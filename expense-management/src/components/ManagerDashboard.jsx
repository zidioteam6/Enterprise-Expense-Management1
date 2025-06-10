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
} from '@mui/icons-material';
import api from '../utils/axios';
import ExpenseGraph from './ExpenseGraph';

const ManagerDashboard = () => {
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
  const [stats, setStats] = useState({
    totalPending: 0,
    totalApproved: 0,
    totalRejected: 0,
    teamExpenses: 0,
  });

  // Fetch all expenses and team data
  useEffect(() => {
    fetchExpenses();
    fetchTeamData();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/expenses/by-approval-status');
      const { approved, notApproved } = response.data;
      
      // Combine all expenses for the full list
      const allExpenses = [...approved, ...notApproved];
      setExpenses(allExpenses);
      
      // Filter pending expenses for the manager view
      setPendingExpenses(notApproved.filter(exp => exp.approvalStatus === 'PENDING'));
      
      // Calculate stats
      const stats = {
        totalPending: notApproved.filter(exp => exp.approvalStatus === 'PENDING').length,
        totalApproved: approved.length,
        totalRejected: notApproved.filter(exp => exp.approvalStatus === 'REJECTED').length,
        teamExpenses: allExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0),
      };
      setStats(stats);
    } catch (err) {
      setError('Failed to fetch expenses: ' + err.message);
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamData = async () => {
    try {
      const response = await api.get('/team/members');
      setTeamMembers(response.data);
    } catch (err) {
      setError('Failed to fetch team data: ' + err.message);
    }
  };

  // Handle expense approval/rejection
  const handleExpenseAction = async (expenseId, action, comment = '') => {
    try {
      await api.put(`/expenses/${expenseId}/${action.toLowerCase()}`, { comment });
      setSuccess(`Expense ${action.toLowerCase()}d successfully`);
      fetchExpenses(); // Refresh the list
    } catch (err) {
      setError(`Failed to ${action.toLowerCase()} expense: ${err.message}`);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action) => {
    try {
      await api.put(`/expenses/bulk/${action.toLowerCase()}`, {
        expenseIds: selectedExpenses,
        comment: comment
      });
      setSuccess(`Bulk ${action.toLowerCase()} successful`);
      setSelectedExpenses([]);
      setComment('');
      fetchExpenses();
    } catch (err) {
      setError(`Bulk ${action.toLowerCase()} failed: ${err.message}`);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async () => {
    if (!commentDialog.expense) {
      console.log('No expense selected for comment');
      return;
    }
    
    console.log('Submitting comment for expense:', commentDialog.expense);
    console.log('Comment text:', comment);
    
    try {
      const response = await api.post(`/expenses/${commentDialog.expense.id}/comment`, { comment });
      console.log('Comment submission response:', response.data);
      setSuccess('Comment added successfully');
      setCommentDialog({ open: false, expense: null });
      setComment('');
      fetchExpenses();
    } catch (err) {
      console.error('Error submitting comment:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      setError('Failed to add comment: ' + err.message);
    }
  };

  // Render the expense table
  const renderExpenseTable = (expenses) => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedExpenses(expenses.map(exp => exp.id));
                  } else {
                    setSelectedExpenses([]);
                  }
                }}
                checked={selectedExpenses.length === expenses.length}
              />
            </TableCell>
            <TableCell>Employee</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
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
                  <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                    {expense.employeeName?.charAt(0) || 'U'}
                  </Avatar>
                  {expense.employeeName || 'Unknown'}
                </Box>
              </TableCell>
              <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
              <TableCell>{expense.category}</TableCell>
              <TableCell>₹{parseFloat(expense.amount).toLocaleString()}</TableCell>
              <TableCell>{expense.description}</TableCell>
              <TableCell>
                <Chip
                  label={expense.approvalStatus}
                  color={
                    expense.approvalStatus === 'APPROVED' ? 'success' :
                    expense.approvalStatus === 'REJECTED' ? 'error' :
                    'warning'
                  }
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {expense.approvalStatus === 'PENDING' && (
                    <>
                      <Tooltip title="Approve">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleExpenseAction(expense.id, 'APPROVE')}
                        >
                          <ApproveIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reject">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleExpenseAction(expense.id, 'REJECT')}
                        >
                          <RejectIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                  <Tooltip title="Add Comment">
                    <IconButton
                      size="small"
                      onClick={() => setCommentDialog({ open: true, expense })}
                    >
                      <CommentIcon />
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
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ width: 48, height: 48, mr: 2 }}>
                  {member.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">{member.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {member.role}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" gutterBottom>
                Total Expenses: ₹{member.total_expenses?.toLocaleString() || 0}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Pending Claims: {member.pending_claims || 0}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ReportIcon />}
                onClick={() => {/* View detailed report */}}
                sx={{ mt: 1 }}
              >
                View Report
              </Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Approvals
              </Typography>
              <Typography variant="h4">
                {stats.totalPending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Approved Expenses
              </Typography>
              <Typography variant="h4">
                {stats.totalApproved}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Rejected Expenses
              </Typography>
              <Typography variant="h4">
                {stats.totalRejected}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Team Expenses
              </Typography>
              <Typography variant="h4">
                ₹{stats.teamExpenses.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Pending Approvals" />
            <Tab label="Team Overview" />
            <Tab label="Expense Reports" />
          </Tabs>
        </Box>

        {/* Bulk Actions */}
        {selectedExpenses.length > 0 && (
          <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
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
          </Box>
        )}

        {/* Tab Content */}
        {activeTab === 0 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Pending Expense Claims</Typography>
              <Box>
                <IconButton onClick={(e) => setFilterAnchor(e.currentTarget)}>
                  <FilterIcon />
                </IconButton>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => {/* Export pending expenses */}}
                >
                  Export
                </Button>
              </Box>
            </Box>
            {renderExpenseTable(pendingExpenses)}
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>Team Overview</Typography>
            {renderTeamOverview()}
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>Expense Reports</Typography>
            <ExpenseGraph expenseData={expenses} />
          </Box>
        )}
      </Paper>

      {/* Comment Dialog */}
      <Dialog open={commentDialog.open} onClose={() => setCommentDialog({ open: false, expense: null })}>
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialog({ open: false, expense: null })}>Cancel</Button>
          <Button onClick={handleCommentSubmit} variant="contained">Submit</Button>
        </DialogActions>
      </Dialog>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchor}
        open={Boolean(filterAnchor)}
        onClose={() => setFilterAnchor(null)}
      >
        <MenuItem onClick={() => {/* Apply filter */}}>By Date</MenuItem>
        <MenuItem onClick={() => {/* Apply filter */}}>By Amount</MenuItem>
        <MenuItem onClick={() => {/* Apply filter */}}>By Category</MenuItem>
        <MenuItem onClick={() => {/* Apply filter */}}>By Employee</MenuItem>
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
        <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0 }} />
      )}
    </Box>
  );
};

export default ManagerDashboard; 