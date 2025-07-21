import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
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
    Avatar,
    Stack,
    Chip,
    Fade,
    useTheme,
    useMediaQuery,
    Divider,
} from '@mui/material';
import {
    Payment,
    Receipt,
    SwapHoriz,
    Description,
    AccountCircle,
    TrendingUp,
    TrendingDown,
    Person,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/api';
import { Transaction } from '../types';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { user, logout } = useAuth();
    const [profilePic, setProfilePic] = useState<string | undefined>(localStorage.getItem('profilePic') || undefined);

    // Listen for profilePic changes in localStorage (e.g., after profile update)
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === 'profilePic') {
                setProfilePic(e.newValue || undefined);
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);
    const [balance, setBalance] = useState<number | null>(null);
    const [accountName, setAccountName] = useState<string>('');
    const [accountNumber, setAccountNumber] = useState<string>('');
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAccountNumber, setShowAccountNumber] = useState(false);
    const [showBalance, setShowBalance] = useState(false);

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
                    setError('Unable to fetch account information. Please try logging in again.');
                    setLoading(false);
                    return;
                }

                setAccountNumber(finalAccountNumber);

                // Fetch balance
                try {
                    const balanceResponse = await userService.balanceEnquiry({ accountNumber: finalAccountNumber });
                    const balance = balanceResponse.accountInfo?.accountBalance ||
                        balanceResponse.accountBalance ||
                        (typeof balanceResponse.responseMessage === 'string' ?
                            parseFloat(balanceResponse.responseMessage) : null);
                    if (balance !== null && !isNaN(balance)) {
                        setBalance(balance);
                    } else {
                        setBalance(null);
                    }
                } catch (error: any) {
                    setBalance(null);
                }

                // Fetch account name
                try {
                    const nameResponse = await userService.nameEnquiry({ accountNumber: finalAccountNumber });
                    if (nameResponse) {
                        setAccountName(nameResponse);
                    }
                } catch (error: any) {
                    // Ignore name fetch error
                }

                // Fetch recent transactions
                try {
                    const today = new Date();
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(today.getDate() - 30);
                    const startDate = thirtyDaysAgo.toISOString().split('T')[0];
                    const endDate = today.toISOString().split('T')[0];
                    const transactionsResponse = await userService.getBankStatement({
                        accountNumber: finalAccountNumber,
                        startDate,
                        endDate,
                    });
                    const sortedTransactions = Array.isArray(transactionsResponse)
                        ? [...transactionsResponse].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
                        : [];
                    setRecentTransactions(sortedTransactions);
                } catch (error: any) {
                    setRecentTransactions([]);
                }

            } catch (error: any) {
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

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: isMobile ? 2 : 6, position: 'relative' }}>
            {/* Profile Icon Top Left */}
            <Box sx={{ position: 'absolute', top: 24, left: 24, zIndex: 10 }}>
                <Avatar
                    src={profilePic}
                    sx={{ bgcolor: 'primary.main', width: 48, height: 48, cursor: 'pointer' }}
                    onClick={() => navigate('/profile')}
                >
                    {!profilePic && <Person fontSize="large" />}
                </Avatar>
            </Box>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            <Fade in timeout={600}>
                <Box>
                    {/* Account Summary Card */}
                    <Paper sx={{ p: isMobile ? 2 : 4, mb: 4, borderRadius: 5, boxShadow: 6 }}>
                        <Stack direction={isMobile ? 'column' : 'row'} spacing={4} alignItems="center" justifyContent="space-between">
                            <Stack direction="row" spacing={2} alignItems="center">
                                {/* Only show the name and details, no duplicate avatar */}
                                <Box>
                                <Typography variant="h5" fontWeight={700} color="primary.main">
                                    {accountName || 'Account Holder'}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                    <Typography variant="subtitle1" color="text.secondary">
                                        Account No: {showAccountNumber ? (accountNumber || 'N/A') : 'xxxx'}
                                    </Typography>
                                    <Button
                                        size="small"
                                        variant="text"
                                        sx={{ minWidth: 0, p: 0.5, fontSize: 13 }}
                                        onClick={() => setShowAccountNumber((prev) => !prev)}
                                    >
                                        {showAccountNumber ? 'Hide' : 'Show'}
                                    </Button>
                                </Box>
                                </Box>
                            </Stack>
                            <Box textAlign={isMobile ? 'left' : 'right'}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Current Balance
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="h4" fontWeight={700} color="secondary.main">
                                        {showBalance
                                            ? `₹${balance !== null ? balance.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}`
                                            : '₹xxxx.xx'}
                                    </Typography>
                                    <Button
                                        size="small"
                                        variant="text"
                                        sx={{ minWidth: 0, p: 0.5, fontSize: 13 }}
                                        onClick={() => setShowBalance((prev) => !prev)}
                                    >
                                        {showBalance ? 'Hide' : 'Show'}
                                    </Button>
                                </Box>
                            </Box>
                        </Stack>
                    </Paper>
                    {/* Quick Actions */}
                    <Paper sx={{ p: isMobile ? 2 : 4, mb: 4, borderRadius: 5, boxShadow: 3 }}>
                        <Typography variant="h6" color="primary.main" fontWeight={600} gutterBottom>
                            Quick Actions
                        </Typography>
                        <Stack direction={isMobile ? 'column' : 'row'} spacing={2}>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<Payment />}
                                sx={{ fontWeight: 600, minWidth: 160 }}
                                onClick={() => navigate('/transactions?type=credit')}
                            >
                                Credit Account
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<Receipt />}
                                sx={{ fontWeight: 600, minWidth: 160 }}
                                onClick={() => navigate('/transactions?type=debit')}
                            >
                                Debit Account
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<SwapHoriz />}
                                sx={{ fontWeight: 600, minWidth: 160 }}
                                onClick={() => navigate('/transactions?type=transfer')}
                            >
                                Transfer Funds
                            </Button>
                            <Button
                                variant="contained"
                                color="secondary"
                                startIcon={<Description />}
                                sx={{ fontWeight: 600, minWidth: 160 }}
                                onClick={() => navigate('/statement')}
                            >
                                Bank Statement
                            </Button>
                        </Stack>
                    </Paper>
                    {/* Recent Transactions */}
                    <Paper sx={{ p: isMobile ? 2 : 4, borderRadius: 5, boxShadow: 3 }}>
                        <Typography variant="h6" color="primary.main" fontWeight={600} gutterBottom>
                            Recent Transactions
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <TableContainer>
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
                                    {recentTransactions.length > 0 ? (
                                        recentTransactions.map((transaction) => (
                                            <TableRow key={transaction.id}>
                                                <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        icon={transaction.transactionType === 'CREDIT' ? <TrendingUp color="success" /> : <TrendingDown color="error" />}
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
                    {/* Logout Button */}
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="outlined" color="error" onClick={handleLogout} sx={{ fontWeight: 600 }}>
                            Logout
                        </Button>
                    </Box>
                </Box>
            </Fade>
        </Container>
    );
};

export default Dashboard;