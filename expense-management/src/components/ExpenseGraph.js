import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  Tabs,
  Tab,
  LinearProgress,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  ComposedChart,
  Line,
  Scatter,
  Rectangle,
  ScatterChart,
} from 'recharts';

const ExpenseGraph = ({ expenseData, monthlyBudget = 500000 }) => {
  const [chartTab, setChartTab] = useState(0);
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [departmentExpenses, setDepartmentExpenses] = useState([]);
  const [categoryComparison, setCategoryComparison] = useState([]);
  const [spendingHeatmap, setSpendingHeatmap] = useState([]);
  const [budgetStatus, setBudgetStatus] = useState({
    total: monthlyBudget,
    spent: 0,
    remaining: monthlyBudget,
    percentage: 0
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];

  useEffect(() => {
    if (expenseData.length > 0) {
      // Calculate total expenses for budget tracking - only from today onwards
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of today

      const totalSpent = expenseData.reduce((sum, exp) => {
        const expDate = new Date(exp.date);
        expDate.setHours(0, 0, 0, 0); // Normalize expense date to start of day

        // Only count expenses from today onwards
        if (expDate >= today) {
          return sum + (parseFloat(exp.amount) || 0);
        }
        return sum;
      }, 0);

      const remaining = Math.max(0, monthlyBudget - totalSpent);
      const percentage = (totalSpent / monthlyBudget) * 100;

      console.log('Budget calculation:', {
        today: today.toISOString(),
        totalSpent,
        monthlyBudget,
        remaining,
        percentage
      });

      setBudgetStatus({
        total: monthlyBudget,
        spent: totalSpent,
        remaining: remaining,
        percentage: percentage
      });

      // 1. Expense Breakdown (Pie Chart)
      const breakdown = expenseData.reduce((acc, exp) => {
        const category = exp.category?.trim() || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += parseFloat(exp.amount) || 0;
        return acc;
      }, {});

      const breakdownData = Object.entries(breakdown)
        .filter(([_, value]) => value > 0)
        .map(([name, value]) => ({
          name: name || 'Uncategorized',
          value: value,
          percentage: (value / expenseData.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0) * 100).toFixed(1)
        }))
        .sort((a, b) => b.value - a.value);

      console.log('Breakdown data:', breakdownData);
      setExpenseBreakdown(breakdownData);

      // 2. Monthly Expense Trend (Area Chart)
      const monthlyData = expenseData.reduce((acc, exp) => {
        const date = new Date(exp.date);
        const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
        if (!acc[monthYear]) {
          acc[monthYear] = { amount: 0, count: 0 };
        }
        acc[monthYear].amount += parseFloat(exp.amount) || 0;
        acc[monthYear].count += 1;
        return acc;
      }, {});

      const trendData = Object.entries(monthlyData)
        .map(([month, data]) => ({
          month,
          amount: data.amount,
          count: data.count,
          average: data.amount / data.count
        }))
        .sort((a, b) => new Date(a.month) - new Date(b.month));
      setMonthlyTrend(trendData);

      // 3. Department-wise Expenses (Stacked Bar Chart)
      const deptData = expenseData.reduce((acc, exp) => {
        const dept = exp.department || 'Other';
        const category = exp.category || 'Uncategorized';
        if (!acc[dept]) {
          acc[dept] = {};
        }
        if (!acc[dept][category]) {
          acc[dept][category] = 0;
        }
        acc[dept][category] += parseFloat(exp.amount) || 0;
        return acc;
      }, {});

      const categories = [...new Set(expenseData.map(e => e.category || 'Uncategorized'))];
      const deptExpenses = Object.entries(deptData).map(([department, cats]) => ({
        department,
        ...categories.reduce((acc, cat) => ({ ...acc, [cat]: cats[cat] || 0 }), {})
      }));
      setDepartmentExpenses(deptExpenses);

      // 4. Category Comparison (Column Chart)
      const categoryData = expenseData.reduce((acc, exp) => {
        const category = exp.category || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = { total: 0, count: 0, approved: 0, pending: 0 };
        }
        acc[category].total += parseFloat(exp.amount) || 0;
        acc[category].count += 1;
        if (exp.approval_status === 'APPROVED') {
          acc[category].approved += parseFloat(exp.amount) || 0;
        } else {
          acc[category].pending += parseFloat(exp.amount) || 0;
        }
        return acc;
      }, {});

      const comparisonData = Object.entries(categoryData).map(([category, data]) => ({
        category,
        total: data.total,
        average: data.total / data.count,
        approved: data.approved,
        pending: data.pending
      }));
      setCategoryComparison(comparisonData);

      // 5. High-Spending Periods (Heat Map)
      const heatmapData = expenseData.reduce((acc, exp) => {
        const date = new Date(exp.date);
        const day = date.getDay(); // 0-6 (Sunday-Saturday)
        const hour = date.getHours(); // 0-23
        const key = `${day}-${hour}`;
        if (!acc[key]) {
          acc[key] = { amount: 0, count: 0 };
        }
        acc[key].amount += parseFloat(exp.amount) || 0;
        acc[key].count += 1;
        return acc;
      }, {});

      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const heatmap = days.map(day => {
        const dayData = {};
        for (let hour = 0; hour < 24; hour++) {
          const key = `${days.indexOf(day)}-${hour}`;
          const data = heatmapData[key] || { amount: 0, count: 0 };
          dayData[`hour${hour}`] = data.amount;
        }
        return { day, ...dayData };
      });
      setSpendingHeatmap(heatmap);
    }
  }, [expenseData, monthlyBudget]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper elevation={3} sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
          <Typography variant="subtitle2">{label}</Typography>
          {payload.map((entry, index) => (
            <Typography key={index} variant="body2" sx={{ color: entry.color }}>
              {entry.name}: ₹{entry.value.toLocaleString()}
              {entry.payload.percentage && ` (${entry.payload.percentage}%)`}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  const renderExpenseBreakdown = () => {
    // Custom label component for better positioning
    const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }) => {
      const RADIAN = Math.PI / 180;
      // Calculate position
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);

      // Show label for all segments, but with different styles based on size
      const isSmallSegment = percent < 0.05;
      const textAnchor = x > cx ? 'start' : 'end';
      const isRightSide = x > cx;

      return (
        <g>
          {/* Background for better readability */}
          <rect
            x={isRightSide ? x - 2 : x - 98}
            y={y - 12}
            width={100}
            height={24}
            fill="rgba(255, 255, 255, 0.9)"
            rx={4}
            stroke="rgba(0,0,0,0.1)"
            strokeWidth={1}
          />
          {/* Category name */}
          <text
            x={x}
            y={y - 2}
            fill="#000"
            textAnchor={textAnchor}
            dominantBaseline="central"
            fontSize={isSmallSegment ? 10 : 11}
            fontWeight="bold"
            style={{ textTransform: 'capitalize' }}
          >
            {name}
          </text>
          {/* Percentage */}
          <text
            x={x}
            y={y + 10}
            fill="#666"
            textAnchor={textAnchor}
            dominantBaseline="central"
            fontSize={isSmallSegment ? 9 : 10}
          >
            {`${(percent * 100).toFixed(0)}%`}
          </text>
        </g>
      );
    };

    // Debug log to check data
    console.log('Rendering pie chart with data:', expenseBreakdown);

    // Custom legend item for better readability
    const CustomLegendItem = ({ value, entry, index }) => (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        margin: '4px 0',
        fontSize: '12px'
      }}>
        <div style={{
          width: '12px',
          height: '12px',
          backgroundColor: entry.color,
          marginRight: '8px',
          borderRadius: '2px'
        }} />
        <span style={{ 
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '150px'
        }}>
          {entry.value} - ₹{value.toLocaleString()}
        </span>
      </div>
    );

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={expenseBreakdown}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={CustomLabel}
              labelLine={false}
              paddingAngle={2}
            >
              {expenseBreakdown.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  stroke="white"
                  strokeWidth={1}
                />
              ))}
            </Pie>
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <Paper elevation={3} sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                        {data.name}
                      </Typography>
                      <Typography variant="body2">
                        Amount: ₹{data.value.toLocaleString()}
                      </Typography>
                      <Typography variant="body2">
                        Percentage: {data.percentage}%
                      </Typography>
                    </Paper>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Custom Legend */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          justifyContent: 'center', 
          gap: '8px',
          mt: 2,
          px: 2
        }}>
          {expenseBreakdown.map((entry, index) => (
            <CustomLegendItem
              key={entry.name}
              value={entry.value}
              entry={{ 
                color: COLORS[index % COLORS.length],
                value: entry.name.charAt(0).toUpperCase() + entry.name.slice(1) // Capitalize first letter
              }}
              index={index}
            />
          ))}
        </Box>
      </Box>
    );
  };

  const renderMonthlyTrend = () => (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart
        data={monthlyTrend}
        margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 12 }}
          tickMargin={10}
          padding={{ left: 20, right: 20 }}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          tickMargin={10}
          tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Area
          type="monotone"
          dataKey="amount"
          fill="#8884d8"
          stroke="#8884d8"
          fillOpacity={0.3}
        />
        <Line
          type="monotone"
          dataKey="amount"
          stroke="#8884d8"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );

  const renderDepartmentExpenses = () => {
    const categories = [...new Set(expenseData.map(e => e.category || 'Uncategorized'))];
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={departmentExpenses}
          margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="department" 
            tick={{ fontSize: 12 }}
            tickMargin={10}
            padding={{ left: 20, right: 20 }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickMargin={10}
            tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {categories.map((category, index) => (
            <Bar 
              key={category} 
              dataKey={category} 
              name={category} 
              stackId="a" 
              fill={COLORS[index % COLORS.length]} 
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderCategoryComparison = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={categoryComparison}
        margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
        layout="vertical"
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          type="number"
          tick={{ fontSize: 12 }}
          tickMargin={10}
          tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`}
        />
        <YAxis 
          type="category"
          dataKey="category"
          tick={{ fontSize: 12 }}
          tickMargin={10}
          width={150}
          padding={{ top: 20, bottom: 20 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="approved" name="Approved Amount" fill="#4caf50" />
        <Bar dataKey="pending" name="Pending Amount" fill="#ff9800" />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderSpendingHeatmap = () => {
    const hours = Array.from({ length: 24 }, (_, i) => `hour${i}`);
    return (
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={spendingHeatmap}
          margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="day"
            tick={{ fontSize: 12 }}
            tickMargin={10}
            padding={{ left: 20, right: 20 }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickMargin={10}
            tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {hours.map((hour, index) => (
            <Bar
              key={hour}
              dataKey={hour}
              name={`${index}:00`}
              fill={COLORS[index % COLORS.length]}
              opacity={0.6}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  // Add Budget Status Display Component
  const BudgetStatusDisplay = () => (
    <Paper elevation={2} sx={{ p: 2, mb: 3, backgroundColor: '#f5f5f5' }}>
      <Typography variant="h6" gutterBottom>
        Monthly Budget Status (From Today)
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Monthly Budget: ₹{budgetStatus.total.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Remaining: ₹{budgetStatus.remaining.toLocaleString()}
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={Math.min(budgetStatus.percentage, 100)} 
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: '#e0e0e0',
            '& .MuiLinearProgress-bar': {
              backgroundColor: budgetStatus.percentage > 90 ? '#f44336' : 
                             budgetStatus.percentage > 75 ? '#ff9800' : '#4caf50',
              borderRadius: 5,
            }
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Spent Today: ₹{budgetStatus.spent.toLocaleString()}
          </Typography>
          <Typography 
            variant="body2" 
            color={budgetStatus.percentage > 90 ? 'error.main' : 
                   budgetStatus.percentage > 75 ? 'warning.main' : 'success.main'}
          >
            {budgetStatus.percentage.toFixed(1)}% of Budget Used
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
          Budget tracking started from {new Date().toLocaleDateString()}
        </Typography>
      </Box>
    </Paper>
  );

  return (
    <Paper className="chart-container" elevation={4} sx={{ p: 3 }}>
      {/* Add Budget Status Display */}
      <BudgetStatusDisplay />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={chartTab} onChange={(e, newValue) => setChartTab(newValue)}>
          <Tab label="Expense Breakdown" />
          <Tab label="Monthly Trend" />
          <Tab label="Department-wise Expenses" />
          <Tab label="Category Comparison" />
          <Tab label="High-Spending Periods" />
        </Tabs>
      </Box>
      
      <Box sx={{ height: '400px' }}>
        {chartTab === 0 && renderExpenseBreakdown()}
        {chartTab === 1 && renderMonthlyTrend()}
        {chartTab === 2 && renderDepartmentExpenses()}
        {chartTab === 3 && renderCategoryComparison()}
        {chartTab === 4 && renderSpendingHeatmap()}
      </Box>
    </Paper>
  );
};

export default ExpenseGraph;