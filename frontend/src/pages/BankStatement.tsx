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
    Avatar,
    Divider,
    Fade,
    useTheme,
    useMediaQuery,
    Stack,
    Chip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/api';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Transaction } from '../types';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
        <Container maxWidth="md" sx={{ py: isMobile ? 2 : 6 }}>
            <Fade in timeout={600}>
                <Paper sx={{ p: isMobile ? 2 : 5, mt: isMobile ? 2 : 6, borderRadius: 5, boxShadow: 6 }}>
                    <Stack direction={isMobile ? 'column' : 'row'} spacing={4} alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                                <AccountBalanceWalletIcon fontSize="large" />
                            </Avatar>
                            <Box>
                                <Typography variant="h5" fontWeight={700} color="primary.main">
                                    {user?.accountInfo?.accountName || 'Account Holder'}
                                </Typography>
                                <Typography variant="subtitle1" color="text.secondary">
                                    Account No: {user?.accountInfo?.accountNumber || 'N/A'}
                                </Typography>
                            </Box>
                        </Stack>
                        <Box textAlign={isMobile ? 'left' : 'right'}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Current Balance
                            </Typography>
                            <Typography variant="h4" fontWeight={700} color="secondary.main">
                                ₹{user?.accountInfo?.accountBalance?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                            </Typography>
                        </Box>
                    </Stack>
                    <Divider sx={{ mb: 4 }} />
                    <Typography variant="h6" gutterBottom color="primary.main" sx={{ fontWeight: 600 }}>
                        Bank Statement
                    </Typography>
                    <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3, mb: 2 }}>
                        <Stack direction={isMobile ? 'column' : 'row'} spacing={2}>
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
                                InputProps={{
                                    startAdornment: <ReceiptLongIcon color="primary" sx={{ mr: 1 }} />,
                                }}
                            />
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
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
                            </LocalizationProvider>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                sx={{ minWidth: 180, mt: isMobile ? 2 : 0, fontWeight: 700 }}
                                disabled={!formik.values.startDate || !formik.values.endDate}
                            >
                                Generate Statement
                            </Button>
                        </Stack>
                    </Box>
                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                    {transactions.length > 0 && (
                        <Fade in timeout={400}>
                            <TableContainer component={Paper} sx={{ mt: 4, borderRadius: 4, boxShadow: 3 }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Type</TableCell>
                                            <TableCell align="right">Amount</TableCell>
                                            <TableCell align="center">Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {transactions.map((transaction) => (
                                            <TableRow key={transaction.id}>
                                                <TableCell>
                                                    {new Date(transaction.createdAt || '').toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        icon={transaction.transactionType === 'CREDIT' ? <TrendingUpIcon color="success" /> : <TrendingDownIcon color="error" />}
                                                        label={transaction.transactionType}
                                                        color={transaction.transactionType === 'CREDIT' ? 'success' : 'error'}
                                                        variant="outlined"
                                                        sx={{ fontWeight: 600 }}
                                                    />
                                                </TableCell>
                                                <TableCell align="right" style={{ fontWeight: 700, color: transaction.transactionType === 'CREDIT' ? theme.palette.success.main : theme.palette.error.main }}>
                                                    {transaction.transactionType === 'CREDIT' ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={transaction.status || 'Success'}
                                                        color={transaction.status === 'FAILED' ? 'error' : 'success'}
                                                        size="small"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Fade>
                    )}
                    {transactions.length === 0 && !error && (
                        <Typography sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}>
                            No transactions found for the selected period
                        </Typography>
                    )}
                </Paper>
            </Fade>
        </Container>
    );
};

export default BankStatement; 