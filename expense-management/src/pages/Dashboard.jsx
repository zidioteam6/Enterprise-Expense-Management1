import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddExpenseForm from '../components/AddExpenseForm';
import ExpenseApprovalDashboard from '../components/ExpenseApprovalDashboard';

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
       const response = await axios.get('http://localhost:8080/api/expenses');
       setExpenses(response.json());
    } catch (err) {
       setError('Error fetching expenses: ' + (err.response ? err.response.data : err.message));
    }
  };

  const handleAddExpense = (newExpense) => {
    fetchExpenses();
    setShowAddForm(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Employee Dashboard</h1>
      {error && ( <div style={{ color: 'red', marginBottom: '10px' }}> {error} </div> )}
      <button onClick={() => setShowAddForm(true)}>Add New Expense</button>
      {showAddForm && ( <AddExpenseForm onAddExpense={handleAddExpense} closeForm={() => setShowAddForm(false)} /> )}
      <h2>All Expenses</h2>
      {expenses.length === 0 ? ( <p>No expenses.</p> ) : ( expenses.map(exp => ( <div key={exp.id} style={{ marginBottom: '5px', padding: '5px', background: '#f9f9f9' }}> {exp.description} (Amount: {exp.amount}, Category: {exp.category}, Date: {exp.date}) </div> )))}
      <h2>Expenses Approval Status</h2>
      <ExpenseApprovalDashboard />
    </div>
  );
};

export default Dashboard; 