import React, { useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/api';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Transaction } from '../types';

const validationSchema = yup.object({
    accountNumber: yup.string().required('Account number is required'),
    startDate: yup.date().required('Start date is required'),
    endDate: yup
        .date()
        .required('End date is required')
        .min(yup.ref('startDate'), 'End date must be after start date'),
});

const BankStatement: React.FC = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [error, setError] = useState<string | null>(null);

    const formik = useFormik({
        initialValues: {
            accountNumber: user?.accountInfo?.accountNumber || '',
            startDate: null as Date | null,
            endDate: null as Date | null,
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            try {
                if (!values.startDate || !values.endDate) return;

                // Set start date to beginning of day
                const startDate = new Date(values.startDate);
                startDate.setHours(0, 0, 0, 0);

                // Set end date to end of day
                const endDate = new Date(values.endDate);
                endDate.setHours(23, 59, 59, 999);

                console.log('Submitting bank statement request with:', {
                    accountNumber: values.accountNumber,
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0]
                });

                const response = await userService.getBankStatement({
                    accountNumber: values.accountNumber,
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0],
                });

                console.log('Bank statement response:', response);
                console.log('Response type:', typeof response);
                console.log('Is array:', Array.isArray(response));
                console.log('Response length:', Array.isArray(response) ? response.length : 'not an array');

                if (Array.isArray(response) && response.length === 0) {
                    setError('No transactions found for the selected date range');
                } else {
                    setTransactions(response);
                    setError(null);
                }
            } catch (err) {
                console.error('Error fetching bank statement:', err);
                setError('Failed to fetch bank statement');
                setTransactions([]);
            }
        },
    });

    return (
        <Container maxWidth="lg">
            <Paper sx={{ p: 4, mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Bank Statement
                </Typography>

                <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3 }}>
                    <TextField
                        fullWidth
                        margin="normal"
                        id="accountNumber"
                        name="accountNumber"
                        label="Account Number"
                        value={formik.values.accountNumber}
                        onChange={formik.handleChange}
                        error={
                            formik.touched.accountNumber && Boolean(formik.errors.accountNumber)
                        }
                        helperText={
                            formik.touched.accountNumber && formik.errors.accountNumber
                        }
                    />

                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <DatePicker
                                label="Start Date"
                                value={formik.values.startDate}
                                onChange={(date: Date | null) => formik.setFieldValue('startDate', date)}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        error:
                                            formik.touched.startDate && Boolean(formik.errors.startDate),
                                        helperText:
                                            formik.touched.startDate && formik.errors.startDate,
                                    },
                                }}
                            />
                            <DatePicker
                                label="End Date"
                                value={formik.values.endDate}
                                onChange={(date: Date | null) => formik.setFieldValue('endDate', date)}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        error:
                                            formik.touched.endDate && Boolean(formik.errors.endDate),
                                        helperText: formik.touched.endDate && formik.errors.endDate,
                                    },
                                }}
                            />
                        </Box>
                    </LocalizationProvider>

                    <Button
                        type="submit"
                        variant="contained"
                        sx={{ mt: 3 }}
                        disabled={!formik.values.startDate || !formik.values.endDate}
                    >
                        Generate Statement
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}

                {transactions.length > 0 && (
                    <TableContainer component={Paper} sx={{ mt: 4 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Transaction Type</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {transactions.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell>
                                            {new Date(transaction.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>{transaction.transactionType}</TableCell>
                                        <TableCell align="right">
                                            ₹{transaction.amount.toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {transactions.length === 0 && !error && (
                    <Typography sx={{ mt: 4, textAlign: 'center' }}>
                        No transactions found for the selected period
                    </Typography>
                )}
            </Paper>
        </Container>
    );
};

export default BankStatement; 