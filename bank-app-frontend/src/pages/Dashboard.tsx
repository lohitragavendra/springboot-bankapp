import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Button,
    Box,
    CircularProgress,
    Alert,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
} from '@mui/material';
import {
    Payment,
    Receipt,
    SwapHoriz,
    Description,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/api';
import { Transaction } from '../types';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [balance, setBalance] = useState<number | null>(null);
    const [accountName, setAccountName] = useState<string>('');
    const [accountNumber, setAccountNumber] = useState<string>('');
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAccountInfo = async () => {
            try {
                setLoading(true);
                setError(null);

                // Get account number from localStorage or user context
                const storedAccountNumber = localStorage.getItem('accountNumber');
                const userAccountNumber = user?.accountInfo?.accountNumber;
                const finalAccountNumber = storedAccountNumber || userAccountNumber;

                if (!finalAccountNumber) {
                    console.warn('No account number found');
                    setError('Unable to fetch account information. Please try logging in again.');
                    setLoading(false);
                    return;
                }

                setAccountNumber(finalAccountNumber);

                // Fetch balance
                try {
                    console.log('Fetching balance for account:', finalAccountNumber);
                    const balanceResponse = await userService.balanceEnquiry({
                        accountNumber: finalAccountNumber,
                    });
                    console.log('Balance enquiry response:', balanceResponse);

                    // Check for balance in different possible locations
                    const balance = balanceResponse.accountInfo?.accountBalance ||
                        balanceResponse.accountBalance ||
                        (typeof balanceResponse.responseMessage === 'string' ?
                            parseFloat(balanceResponse.responseMessage) : null);

                    console.log('Extracted balance:', balance);

                    if (balance !== null && !isNaN(balance)) {
                        setBalance(balance);
                    } else {
                        console.warn('Invalid balance value:', balance);
                        setBalance(null);
                    }
                } catch (error: any) {
                    console.error('Error fetching balance:', error);
                    console.error('Error details:', {
                        message: error.message,
                        response: error.response?.data,
                        status: error.response?.status
                    });
                    setBalance(null);
                }

                // Fetch account name
                try {
                    console.log('Fetching name for account:', finalAccountNumber);
                    const nameResponse = await userService.nameEnquiry({
                        accountNumber: finalAccountNumber,
                    });
                    console.log('Name enquiry response:', nameResponse);
                    if (nameResponse) {
                        setAccountName(nameResponse);
                    } else {
                        console.warn('Empty name response received');
                    }
                } catch (error: any) {
                    console.error('Error fetching account name:', error);
                    console.error('Error details:', {
                        message: error.message,
                        response: error.response?.data,
                        status: error.response?.status
                    });
                    // Don't set error state for name fetch failure
                }

                // Fetch recent transactions
                try {
                    console.log('Fetching transactions for account:', finalAccountNumber);
                    const today = new Date();
                    const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
                    const startDate = thirtyDaysAgo.toISOString().split('T')[0];
                    const endDate = new Date().toISOString().split('T')[0];

                    console.log('Date range:', { startDate, endDate });

                    const transactionsResponse = await userService.getBankStatement({
                        accountNumber: finalAccountNumber,
                        startDate,
                        endDate,
                    });
                    console.log('Raw transactions response:', transactionsResponse);

                    // Sort transactions by date in descending order and take the most recent 5
                    const sortedTransactions = Array.isArray(transactionsResponse)
                        ? [...transactionsResponse].sort((a, b) => {
                            console.log('Comparing dates:', {
                                a: a.createdAt,
                                b: b.createdAt,
                                aTime: new Date(a.createdAt).getTime(),
                                bTime: new Date(b.createdAt).getTime()
                            });
                            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                        }).slice(0, 5)
                        : [];

                    console.log('Sorted transactions:', sortedTransactions);
                    setRecentTransactions(sortedTransactions);
                } catch (error: any) {
                    console.error('Error fetching transactions:', error);
                    console.error('Error details:', {
                        message: error.message,
                        response: error.response?.data,
                        status: error.response?.status,
                        config: error.config
                    });
                    setRecentTransactions([]);
                }

            } catch (error: any) {
                console.error('Error in fetchAccountInfo:', error);
                // Only set error if it's a critical error
                if (error.response?.status === 401) {
                    setError('Session expired. Please log in again.');
                } else {
                    setError('Failed to fetch some account information. Please try refreshing the page.');
                }
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchAccountInfo();
        }
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            <Grid container spacing={3}>
                {/* Account Summary */}
                <Grid item xs={12} md={8} lg={9}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            height: 240,
                        }}
                    >
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            Account Summary
                        </Typography>
                        <Typography component="p" variant="h4">
                            {accountName || 'Loading...'}
                        </Typography>
                        <Typography component="p" variant="h6" color="text.secondary">
                            Account Number: {accountNumber || 'Loading...'}
                        </Typography>
                        <Typography component="p" variant="h4" sx={{ mt: 2 }}>
                            Balance: {balance !== null ? formatAmount(balance) : 'Loading...'}
                        </Typography>
                    </Paper>
                </Grid>

                {/* Quick Actions */}
                <Grid item xs={12} md={4} lg={3}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            height: 240,
                        }}
                    >
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            Quick Actions
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Button
                                variant="outlined"
                                startIcon={<Payment />}
                                onClick={() => navigate('/transactions?type=credit')}
                            >
                                Credit Account
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<Receipt />}
                                onClick={() => navigate('/transactions?type=debit')}
                            >
                                Debit Account
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<SwapHoriz />}
                                onClick={() => navigate('/transactions?type=transfer')}
                            >
                                Transfer Funds
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<Description />}
                                onClick={() => navigate('/statement')}
                            >
                                Bank Statement
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                {/* Recent Transactions */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            Recent Transactions
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Transaction Type</TableCell>
                                        <TableCell align="right">Amount</TableCell>
                                        <TableCell>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {recentTransactions.length > 0 ? (
                                        recentTransactions.map((transaction) => (
                                            <TableRow key={transaction.id}>
                                                <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                                                <TableCell>{transaction.transactionType}</TableCell>
                                                <TableCell align="right">{formatAmount(transaction.amount)}</TableCell>
                                                <TableCell>{transaction.status || 'SUCCESS'}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">
                                                No recent transactions
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>

            {/* Logout Button */}
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="outlined" color="error" onClick={handleLogout}>
                    Logout
                </Button>
            </Box>
        </Container>
    );
};

export default Dashboard; 