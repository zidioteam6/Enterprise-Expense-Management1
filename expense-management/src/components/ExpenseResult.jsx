import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, Clock, DollarSign, Calendar, User, FileText, Filter, Search, Download, AlertCircle, Users, CheckSquare } from 'lucide-react';


export default function ExpenseResult() {

    // Mock user data - in real app, this would come from auth context
  const [currentUser] = useState({
    id: 1,
    name: 'Sarah Johnson',
    role: 'manager', // 'manager', 'super_manager', or 'admin'
    department: 'Engineering'
  });

  // Mock expense data with multi-stage approval
  const [expenses, setExpenses] = useState([
    {
      id: 1,
      employeeName: 'John Smith',
      employeeId: 'EMP001',
      department: 'Engineering',
      amount: 245.50,
      category: 'Travel',
      description: 'Client meeting transportation',
      date: '2024-05-28',
      submittedDate: '2024-05-29',
      status: 'pending_manager',
      priority: 'medium',
      receipts: ['receipt1.pdf'],
      comments: 'Uber ride to downtown client office',
      approvalStages: {
        manager: { status: 'pending', approver: null, date: null, comment: '' },
        super_manager: { status: 'pending', approver: null, date: null, comment: '' },
        admin: { status: 'pending', approver: null, date: null, comment: '' }
      },
      currentStage: 'manager'
    },
    {
      id: 2,
      employeeName: 'Emily Davis',
      employeeId: 'EMP002',
      department: 'Marketing',
      amount: 89.99,
      category: 'Office Supplies',
      description: 'Software subscription',
      date: '2024-05-27',
      submittedDate: '2024-05-28',
      status: 'auto_approved',
      priority: 'low',
      receipts: ['receipt2.pdf'],
      comments: 'Monthly Canva Pro subscription for design work',
      approvalStages: {
        manager: { status: 'auto_approved', approver: 'System', date: '2024-05-28', comment: 'Auto-approved: Amount < $100' },
        super_manager: { status: 'auto_approved', approver: 'System', date: '2024-05-28', comment: 'Auto-approved: Amount < $100' },
        admin: { status: 'auto_approved', approver: 'System', date: '2024-05-28', comment: 'Auto-approved: Amount < $100' }
      },
      currentStage: 'completed'
    },
    {
      id: 3,
      employeeName: 'Michael Brown',
      employeeId: 'EMP003',
      department: 'Sales',
      amount: 1250.00,
      category: 'Entertainment',
      description: 'Client dinner',
      date: '2024-05-26',
      submittedDate: '2024-05-27',
      status: 'pending_super_manager',
      priority: 'high',
      receipts: ['receipt3.pdf', 'receipt4.pdf'],
      comments: 'Dinner with potential enterprise client - 6 people',
      approvalStages: {
        manager: { status: 'approved', approver: 'Sarah Johnson', date: '2024-05-27', comment: 'Valid business expense' },
        super_manager: { status: 'pending', approver: null, date: null, comment: '' },
        admin: { status: 'pending', approver: null, date: null, comment: '' }
      },
      currentStage: 'super_manager'
    },
    {
      id: 4,
      employeeName: 'Lisa Wilson',
      employeeId: 'EMP004',
      department: 'Engineering',
      amount: 450.00,
      category: 'Training',
      description: 'Conference registration',
      date: '2024-05-25',
      submittedDate: '2024-05-26',
      status: 'fully_approved',
      priority: 'medium',
      receipts: ['receipt5.pdf'],
      comments: 'React Summit 2024 registration fee',
      approvalStages: {
        manager: { status: 'approved', approver: 'Sarah Johnson', date: '2024-05-26', comment: 'Good for professional development' },
        super_manager: { status: 'approved', approver: 'Mark Davis', date: '2024-05-27', comment: 'Approved for training budget' },
        admin: { status: 'approved', approver: 'Jennifer Lee', date: '2024-05-28', comment: 'Final approval granted' }
      },
      currentStage: 'completed'
    },
    {
      id: 5,
      employeeName: 'Robert Chen',
      employeeId: 'EMP005',
      department: 'Marketing',
      amount: 75.00,
      category: 'Office Supplies',
      description: 'Team lunch',
      date: '2024-05-29',
      submittedDate: '2024-05-30',
      status: 'auto_approved',
      priority: 'low',
      receipts: ['receipt6.pdf'],
      comments: 'Pizza for late night project work',
      approvalStages: {
        manager: { status: 'auto_approved', approver: 'System', date: '2024-05-30', comment: 'Auto-approved: Amount < $100' },
        super_manager: { status: 'auto_approved', approver: 'System', date: '2024-05-30', comment: 'Auto-approved: Amount < $100' },
        admin: { status: 'auto_approved', approver: 'System', date: '2024-05-30', comment: 'Auto-approved: Amount < $100' }
      },
      currentStage: 'completed'
    },
    {
      id: 6,
      employeeName: 'Alice Johnson',
      employeeId: 'EMP006',
      department: 'Sales',
      amount: 800.00,
      category: 'Travel',
      description: 'Flight to conference',
      date: '2024-05-24',
      submittedDate: '2024-05-25',
      status: 'rejected',
      priority: 'medium',
      receipts: ['receipt7.pdf'],
      comments: 'Business class flight to tech conference',
      approvalStages: {
        manager: { status: 'approved', approver: 'Tom Wilson', date: '2024-05-25', comment: 'Conference is relevant' },
        super_manager: { status: 'rejected', approver: 'Mark Davis', date: '2024-05-26', comment: 'Business class not approved for domestic flights' },
        admin: { status: 'pending', approver: null, date: null, comment: '' }
      },
      currentStage: 'completed'
    }
  ]);

  const [filters, setFilters] = useState({
    status: 'all',
    department: 'all',
    priority: 'all',
    stage: 'all'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [comment, setComment] = useState('');

  // Auto-approve logic
  useEffect(() => {
    setExpenses(prevExpenses =>
      prevExpenses.map(expense => {
        if (expense.amount < 100 && expense.status === 'pending_manager') {
          return {
            ...expense,
            status: 'auto_approved',
            currentStage: 'completed',
            approvalStages: {
              manager: { status: 'auto_approved', approver: 'System', date: new Date().toISOString().split('T')[0], comment: 'Auto-approved: Amount < $100' },
              super_manager: { status: 'auto_approved', approver: 'System', date: new Date().toISOString().split('T')[0], comment: 'Auto-approved: Amount < $100' },
              admin: { status: 'auto_approved', approver: 'System', date: new Date().toISOString().split('T')[0], comment: 'Auto-approved: Amount < $100' }
            }
          };
        }
        return expense;
      })
    );
  }, []);

  // Get role hierarchy
  const getRoleHierarchy = () => {
    const roles = ['manager', 'super_manager', 'admin'];
    return roles;
  };

  // Check if user can act on this expense
  const canUserAct = (expense) => {
    if (expense.amount < 100) return false; // Auto-approved
    if (expense.status === 'fully_approved' || expense.status === 'rejected' || expense.status === 'auto_approved') return false;
    
    const userRoleIndex = getRoleHierarchy().indexOf(currentUser.role);
    const currentStageIndex = getRoleHierarchy().indexOf(expense.currentStage);
    
    return userRoleIndex === currentStageIndex;
  };

  // Get next stage after approval
  const getNextStage = (currentStage) => {
    const stages = getRoleHierarchy();
    const currentIndex = stages.indexOf(currentStage);
    return currentIndex < stages.length - 1 ? stages[currentIndex + 1] : 'completed';
  };

  // Filter expenses based on current filters and search
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (filters.status !== 'all') {
      if (filters.status === 'pending') {
        matchesStatus = expense.status.includes('pending');
      } else {
        matchesStatus = expense.status === filters.status;
      }
    }
    
    const matchesDepartment = filters.department === 'all' || expense.department === filters.department;
    const matchesPriority = filters.priority === 'all' || expense.priority === filters.priority;
    const matchesStage = filters.stage === 'all' || expense.currentStage === filters.stage;
    
    return matchesSearch && matchesStatus && matchesDepartment && matchesPriority && matchesStage;
  });

  // Get summary statistics
  const stats = {
    pending: expenses.filter(e => e.status.includes('pending')).length,
    approved: expenses.filter(e => e.status === 'fully_approved' || e.status === 'auto_approved').length,
    rejected: expenses.filter(e => e.status === 'rejected').length,
    totalAmount: expenses.filter(e => e.status.includes('pending')).reduce((sum, e) => sum + e.amount, 0),
    myPending: expenses.filter(e => canUserAct(e)).length
  };

  const handleAction = (expense, action) => {
    setSelectedExpense(expense);
    setActionType(action);
    setShowModal(true);
  };

  const submitAction = () => {
    setExpenses(prevExpenses =>
      prevExpenses.map(expense => {
        if (expense.id === selectedExpense.id) {
          const updatedStages = { ...expense.approvalStages };
          const currentStage = expense.currentStage;
          
          // Update current stage
          updatedStages[currentStage] = {
            status: actionType,
            approver: currentUser.name,
            date: new Date().toISOString().split('T')[0],
            comment: comment
          };

          let newStatus = expense.status;
          let newCurrentStage = expense.currentStage;

          if (actionType === 'rejected') {
            newStatus = 'rejected';
            newCurrentStage = 'completed';
          } else if (actionType === 'approved') {
            const nextStage = getNextStage(currentStage);
            if (nextStage === 'completed') {
              newStatus = 'fully_approved';
              newCurrentStage = 'completed';
            } else {
              newStatus = `pending_${nextStage}`;
              newCurrentStage = nextStage;
            }
          }

          return {
            ...expense,
            status: newStatus,
            currentStage: newCurrentStage,
            approvalStages: updatedStages
          };
        }
        return expense;
      })
    );
    
    setShowModal(false);
    setComment('');
    setSelectedExpense(null);
    setActionType(null);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'fully_approved':
      case 'auto_approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending_manager':
      case 'pending_super_manager':
      case 'pending_admin':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending_manager': return 'Pending Manager';
      case 'pending_super_manager': return 'Pending Super Manager';
      case 'pending_admin': return 'Pending Admin';
      case 'fully_approved': return 'Fully Approved';
      case 'auto_approved': return 'Auto Approved';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const getStageIcon = (stage, status) => {
    if (status === 'approved' || status === 'auto_approved') {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    } else if (status === 'rejected') {
      return <XCircle className="w-4 h-4 text-red-600" />;
    } else if (status === 'pending') {
      return <Clock className="w-4 h-4 text-yellow-600" />;
    }
    return <div className="w-4 h-4 rounded-full bg-gray-300"></div>;
  };


    return (
        <>
            {/* Expense List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Expense Requests</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approval Flow</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredExpenses.map((expense) => (
                                <tr key={expense.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                    <User className="h-5 w-5 text-gray-600" />
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{expense.employeeName}</div>
                                                <div className="text-sm text-gray-500">{expense.department}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">${expense.amount.toFixed(2)}</div>
                                        {expense.amount < 100 && (
                                            <div className="text-xs text-green-600">Auto-approve eligible</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{expense.category}</div>
                                        <div className="text-sm text-gray-500 truncate max-w-xs">{expense.description}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{expense.date}</div>
                                        <div className="text-sm text-gray-500">Submitted: {expense.submittedDate}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(expense.priority)}`}>
                                            {expense.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(expense.status)}`}>
                                            {getStatusLabel(expense.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            {getRoleHierarchy().map((stage, index) => (
                                                <div key={stage} className="flex items-center">
                                                    <div className="flex flex-col items-center">
                                                        {getStageIcon(stage, expense.approvalStages[stage].status)}
                                                        <span className="text-xs text-gray-500 mt-1 capitalize">
                                                            {stage.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                    {index < getRoleHierarchy().length - 1 && (
                                                        <div className="w-4 h-px bg-gray-300 mx-1"></div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => setSelectedExpense(expense)}
                                                className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {canUserAct(expense) && (
                                                <>
                                                    <button
                                                        onClick={() => handleAction(expense, 'approved')}
                                                        className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-100"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(expense, 'rejected')}
                                                        className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"
                                                        title="Reject"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}