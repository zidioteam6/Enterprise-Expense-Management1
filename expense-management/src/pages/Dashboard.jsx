import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
import AddExpenseForm from '../components/AddExpenseForm';
import ExpenseApprovalDashboard from '../components/ExpenseApprovalDashboard';

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExpenses();
    fetchAuditLogs();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await api.get('/expenses');
      setExpenses(response.data);
      setError('');
    } catch (err) {
      const errorMessage = err.response
        ? `API Error: ${err.response.status} - ${err.response.data.message || 'Unknown error'}`
        : `Network Error: ${err.message}`;
      setError(errorMessage);
      console.error('Error fetching expenses:', err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await api.get('/audit/logs');
      setAuditLogs(response.data);
      setError('');
    } catch (err) {
      const errorMessage = err.response
        ? `API Error: ${err.response.status} - ${err.response.data.message || 'Unknown error'}`
        : `Network Error: ${err.message}`;
      setError(errorMessage);
      console.error('Error fetching audit logs:', err);
    }
  };

  const handleAddExpense = (newExpense) => {
    fetchExpenses();
    fetchAuditLogs(); // Refresh audit logs after adding expense
    setShowAddForm(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Employee Dashboard</h1>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      <button onClick={() => setShowAddForm(true)}>Add New Expense</button>
      {showAddForm && <AddExpenseForm onAddExpense={handleAddExpense} closeForm={() => setShowAddForm(false)} />}
      
      <h2>All Expenses</h2>
      {expenses.length === 0 ? (
        <p>No expenses.</p>
      ) : (
        expenses.map(exp => (
          <div key={exp.id} style={{ marginBottom: '5px', padding: '5px', background: '#f9f9f9' }}>
            {exp.description} (Amount: {exp.amount}, Category: {exp.category}, Date: {exp.date})
          </div>
        ))
      )}

      <h2>Audit Logs</h2>
      <div style={{ marginTop: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Timestamp</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>User</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Action</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Details</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>
                  No audit logs available
                </td>
              </tr>
            ) : (
              auditLogs.map((log, index) => (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9' }}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{new Date(log.timestamp).toLocaleString()}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{log.user}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{log.action}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{log.details}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{log.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <h2>Expenses Approval Status</h2>
      <ExpenseApprovalDashboard />
    </div>
  );
};

export default Dashboard; 