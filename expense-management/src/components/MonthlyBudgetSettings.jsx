import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography } from '@mui/material';
import api from '../utils/axios';

const MonthlyBudgetSettings = ({ open, onClose, onBudgetUpdate }) => {
  const [budget, setBudget] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCurrentBudget();
    }
  }, [open]);

  const fetchCurrentBudget = async () => {
    try {
      const response = await api.get('/settings/monthly-budget');
      const currentBudget = parseFloat(response.data.budget) || 500000;
      setBudget(currentBudget.toString());
      setError('');
    } catch (err) {
      console.error('Error fetching budget:', err);
      setBudget('500000');
      setError('Failed to fetch current budget');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const newBudget = parseFloat(budget);
      if (isNaN(newBudget) || newBudget < 0) {
        setError('Please enter a valid positive number');
        return;
      }

      const response = await api.put('/settings/monthly-budget', { 
        budget: newBudget 
      });
      
      onBudgetUpdate(parseFloat(response.data.budget));
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update budget');
      console.error('Error updating budget:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Set Monthly Budget</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <TextField
            autoFocus
            margin="dense"
            label="Monthly Budget (₹)"
            type="number"
            fullWidth
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            error={!!error}
            helperText={error || "Enter the monthly budget amount"}
            inputProps={{
              min: "0",
              step: "1000"
            }}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Budget'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MonthlyBudgetSettings; 