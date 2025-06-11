import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      // Fetch all expenses pending admin approval
      const res = await axios.get('/api/expenses/pending/PENDING_ADMIN');
      setExpenses(res.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch expenses');
    }
    setLoading(false);
  };

  const handleApprove = async (expenseId) => {
    try {
      await axios.put(`/api/expenses/${expenseId}/approve`);
      setSuccess('Expense approved!');
      fetchExpenses();
    } catch (err) {
      setError('Failed to approve expense');
    }
  };

  const handleReject = async (expenseId) => {
    try {
      await axios.put(`/api/expenses/${expenseId}/reject`);
      setSuccess('Expense rejected!');
      fetchExpenses();
    } catch (err) {
      setError('Failed to reject expense');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Admin Dashboard</h2>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
      <table border="1" cellPadding="8" style={{ width: '100%', marginTop: 16 }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Employee</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Description</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.length === 0 && !loading && (
            <tr><td colSpan="8">No expenses pending admin approval.</td></tr>
          )}
          {expenses.map(exp => (
            <tr key={exp.id}>
              <td>{exp.id}</td>
              <td>{exp.employeeId}</td>
              <td>₹{exp.amount}</td>
              <td>{exp.category}</td>
              <td>{exp.description}</td>
              <td>{exp.date}</td>
              <td>{exp.approvalStatus}</td>
              <td>
                <button onClick={() => handleApprove(exp.id)} style={{ marginRight: 8 }}>Approve</button>
                <button onClick={() => handleReject(exp.id)}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard; 