import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Button,
    Box,
    Card,
    CardContent,
} from '@mui/material';
import {
    Payment,
    Receipt,
    SwapHoriz,
    Description,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/api';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [balance, setBalance] = useState<number | null>(null);
    const [accountName, setAccountName] = useState<string>('');

    useEffect(() => {
        const fetchAccountInfo = async () => {
            if (user?.accountInfo?.accountNumber) {
                try {
                    const balanceResponse = await userService.balanceEnquiry({
                        accountNumber: user.accountInfo.accountNumber,
                    });
                    const nameResponse = await userService.nameEnquiry({
                        accountNumber: user.accountInfo.accountNumber,
                    });

                    if (balanceResponse.responseCode === '00' && balanceResponse.accountInfo) {
                        setBalance(balanceResponse.accountInfo.accountBalance);
                    }
                    setAccountName(nameResponse);
                } catch (error) {
                    console.error('Error fetching account info:', error);
                }
            }
        };

        fetchAccountInfo();
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
                            {accountName}
                        </Typography>
                        <Typography component="p" variant="h6" color="text.secondary">
                            Account Number: {user?.accountInfo?.accountNumber}
                        </Typography>
                        <Typography component="p" variant="h4" sx={{ mt: 2 }}>
                            Balance: ${balance?.toFixed(2) || '0.00'}
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
                        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', p: 1 }}>
                            {/* Placeholder for recent transactions */}
                            <Card sx={{ minWidth: 275 }}>
                                <CardContent>
                                    <Typography color="text.secondary" gutterBottom>
                                        No recent transactions
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Box>
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