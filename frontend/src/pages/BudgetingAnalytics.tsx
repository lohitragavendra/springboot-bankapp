import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Divider, useTheme } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { userService } from '../services/api';
import { Transaction } from '../types';

const PIE_COLORS = ['#1976d2', '#e53935']; // Blue for Credit, Red for Debit

const BudgetingAnalytics: React.FC = () => {
  const theme = useTheme();
  const [credit, setCredit] = useState(0);
  const [debit, setDebit] = useState(0);
  useEffect(() => {
    userService.getTransactions()
      .then((transactions: Transaction[]) => {
        let creditSum = 0;
        let debitSum = 0;
        transactions.forEach(tx => {
          if (tx.transactionType === 'CREDIT' || tx.type === 'CREDIT') creditSum += tx.amount;
          if (tx.transactionType === 'DEBIT' || tx.type === 'DEBIT') debitSum += tx.amount;
        });
        setCredit(creditSum);
        setDebit(debitSum);
      })
      .catch(() => {
        setCredit(0);
        setDebit(0);
      });
  }, []);

  const pieData = [
    { name: 'Credit', value: credit },
    { name: 'Debit', value: debit },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom color={theme.palette.primary.main}>
        Budgeting & Analytics
      </Typography>
      <Divider sx={{ mb: 3 }} />
      <Paper elevation={4} sx={{ p: 4, borderRadius: 5, maxWidth: 500, mx: 'auto', boxShadow: 8 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom align="center">
          Credit vs Debit
        </Typography>
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={110}
              label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(1) : '0.0'}%`}
            >
              {pieData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number, name: string) => [`₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, name]} />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
}

export default BudgetingAnalytics;
