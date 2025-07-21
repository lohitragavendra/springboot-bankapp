import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Divider, useTheme, Button, Snackbar, Alert } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis, Legend, LineChart, Line } from 'recharts';
import { userService } from '../services/api';
import { Transaction } from '../types';

const CATEGORY_COLORS = [
  '#0050b3', // Deep blue
  '#00b386', // Teal
  '#ffa726', // Orange
  '#e53935', // Red
  '#43a047', // Green
  '#1976d2', // Blue
  '#dc004e', // Pink
  '#8e24aa', // Purple
  '#fbc02d', // Yellow
  '#6d4c41', // Brown
];

const getCategoryColor = (idx: number) => CATEGORY_COLORS[idx % CATEGORY_COLORS.length];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const DEFAULT_BUDGET = 1000;

const BudgetingAnalytics: React.FC = () => {
  const theme = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [budget, setBudget] = useState<number>(DEFAULT_BUDGET);
  const [openAlert, setOpenAlert] = useState(false);
  const [overspent, setOverspent] = useState(false);

  useEffect(() => {
    userService.getTransactions()
      .then((transactions: Transaction[]) => {
        setTransactions(transactions || []);
      })
      .catch(() => setTransactions([]));
  }, []);

  useEffect(() => {
    // Group by category
    const catMap: Record<string, number> = {};
    let totalSpent = 0;
    transactions.forEach(tx => {
      const isDebit = tx.type === 'DEBIT' || tx.transactionType === 'DEBIT';
      if (isDebit) {
        catMap[tx.category || 'Other'] = (catMap[tx.category || 'Other'] || 0) + tx.amount;
        totalSpent += tx.amount;
      }
    });
    setCategoryData(Object.entries(catMap).map(([name, value], idx) => ({ name, value, color: getCategoryColor(idx) })));

    // Group by month
    const monthMap: Record<string, number> = {};
    transactions.forEach(tx => {
      const isDebit = tx.type === 'DEBIT' || tx.transactionType === 'DEBIT';
      if (isDebit) {
        const dateStr = tx.date || tx.createdAt;
        if (!dateStr) return;
        const date = new Date(dateStr);
        const key = `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
        monthMap[key] = (monthMap[key] || 0) + tx.amount;
      }
    });
    setMonthlyData(Object.entries(monthMap).map(([month, spent]) => ({ month, spent })));

    // Budget alert
    if (totalSpent > budget) {
      setOverspent(true);
      setOpenAlert(true);
    } else {
      setOverspent(false);
    }
  }, [transactions, budget]);

  const handleCloseAlert = () => setOpenAlert(false);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom color={theme.palette.primary.main}>
        Budgeting & Analytics
      </Typography>
      <Divider sx={{ mb: 3 }} />
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>Spending by Category</Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  {categoryData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>Spending Trends</Typography>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="spent" stroke={theme.palette.primary.main} strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>Budget Planner</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Set your monthly budget and get alerts if you overspend.
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography>Budget:</Typography>
              <input
                type="number"
                value={budget}
                min={0}
                onChange={e => setBudget(Number(e.target.value))}
                style={{ width: 100, padding: 6, borderRadius: 8, border: '1px solid #ccc', fontSize: 16 }}
              />
              <Button variant="contained" color="primary" onClick={() => setOpenAlert(true)}>
                Save
              </Button>
            </Box>
            <Typography mt={2} color={overspent ? 'error' : 'success.main'} fontWeight={600}>
              {overspent ? 'You have exceeded your budget!' : 'You are within your budget.'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      <Snackbar open={openAlert} autoHideDuration={4000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={overspent ? 'error' : 'success'} sx={{ width: '100%' }}>
          {overspent ? 'Overspending Alert! You have exceeded your budget.' : 'Budget updated successfully.'}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BudgetingAnalytics;
