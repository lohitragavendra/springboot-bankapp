import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
    Tabs,
    Tab,
    Fade,
    Stack,
    useTheme,
    useMediaQuery,
    InputAdornment,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/api';
import { useFormik } from 'formik';
import * as yup from 'yup';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`transaction-tabpanel-${index}`}
            aria-labelledby={`transaction-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

const Transactions: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [tabValue, setTabValue] = useState(0);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const type = searchParams.get('type');
        switch (type) {
            case 'credit':
                setTabValue(0);
                break;
            case 'debit':
                setTabValue(1);
                break;
            case 'transfer':
                setTabValue(2);
                break;
            default:
                setTabValue(0);
        }
    }, [searchParams]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        setError(null);
        setSuccess(null);
    };

    const creditValidationSchema = yup.object({
        accountNumber: yup.string().required('Account number is required'),
        amount: yup
            .number()
            .positive('Amount must be positive')
            .required('Amount is required'),
    });

    const transferValidationSchema = yup.object({
        sourceAccountNumber: yup.string().required('Source account number is required'),
        destinationAccountNumber: yup
            .string()
            .required('Destination account number is required'),
        amount: yup
            .number()
            .positive('Amount must be positive')
            .required('Amount is required'),
    });

    const creditFormik = useFormik({
        initialValues: {
            accountNumber: user?.accountInfo?.accountNumber || '',
            amount: '',
        },
        validationSchema: creditValidationSchema,
        onSubmit: async (values) => {
            try {
                const response = await userService.creditAccount({
                    accountNumber: values.accountNumber,
                    amount: parseFloat(values.amount),
                });
                if (response.responseCode === '00') {
                    setSuccess('Account credited successfully');
                    setTimeout(() => navigate('/'), 2000);
                } else {
                    setError(response.responseMessage);
                }
            } catch (err) {
                setError('Failed to credit account');
            }
        },
    });

    const debitFormik = useFormik({
        initialValues: {
            accountNumber: user?.accountInfo?.accountNumber || '',
            amount: '',
        },
        validationSchema: creditValidationSchema,
        onSubmit: async (values) => {
            try {
                const response = await userService.debitAccount({
                    accountNumber: values.accountNumber,
                    amount: parseFloat(values.amount),
                });
                if (response.responseCode === '00') {
                    setSuccess('Account debited successfully');
                    setTimeout(() => navigate('/'), 2000);
                } else {
                    setError(response.responseMessage);
                }
            } catch (err) {
                setError('Failed to debit account');
            }
        },
    });

    const transferFormik = useFormik({
        initialValues: {
            sourceAccountNumber: user?.accountInfo?.accountNumber || '',
            destinationAccountNumber: '',
            amount: '',
        },
        validationSchema: transferValidationSchema,
        onSubmit: async (values) => {
            try {
                const response = await userService.transfer({
                    sourceAccountNumber: values.sourceAccountNumber,
                    destinationAccountNumber: values.destinationAccountNumber,
                    amount: parseFloat(values.amount),
                });
                if (response.responseCode === '00') {
                    setSuccess('Transfer completed successfully');
                    setTimeout(() => navigate('/'), 2000);
                } else {
                    setError(response.responseMessage);
                }
            } catch (err) {
                setError('Failed to transfer funds');
            }
        },
    });

    return (
        <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Fade in timeout={600}>
                <Paper elevation={6} sx={{ p: isMobile ? 2 : 4, borderRadius: 5, width: '100%', boxShadow: 8 }}>
                    <Stack spacing={3} alignItems="center">
                        <AccountBalanceWalletIcon color="primary" sx={{ fontSize: 48 }} />
                        <Tabs value={tabValue} onChange={handleTabChange} centered variant={isMobile ? 'fullWidth' : 'standard'} sx={{ width: '100%' }}>
                            <Tab icon={<TrendingUpIcon color="success" />} label="Credit" />
                            <Tab icon={<TrendingDownIcon color="error" />} label="Debit" />
                            <Tab icon={<SwapHorizIcon color="primary" />} label="Transfer" />
                        </Tabs>
                        {error && (
                            <Alert severity="error" sx={{ width: '100%' }}>
                                {error}
                            </Alert>
                        )}
                        {success && (
                            <Alert severity="success" sx={{ width: '100%' }}>
                                {success}
                            </Alert>
                        )}
                        <TabPanel value={tabValue} index={0}>
                            <Typography variant="h6" fontWeight={600} gutterBottom color="primary.main">
                                Credit Account
                            </Typography>
                            <form onSubmit={creditFormik.handleSubmit}>
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    id="accountNumber"
                                    name="accountNumber"
                                    label="Account Number"
                                    value={creditFormik.values.accountNumber}
                                    onChange={creditFormik.handleChange}
                                    error={
                                        creditFormik.touched.accountNumber &&
                                        Boolean(creditFormik.errors.accountNumber)
                                    }
                                    helperText={
                                        creditFormik.touched.accountNumber && creditFormik.errors.accountNumber
                                    }
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <AccountCircleIcon color="primary" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    id="amount"
                                    name="amount"
                                    label="Amount"
                                    type="number"
                                    value={creditFormik.values.amount}
                                    onChange={creditFormik.handleChange}
                                    error={creditFormik.touched.amount && Boolean(creditFormik.errors.amount)}
                                    helperText={creditFormik.touched.amount && creditFormik.errors.amount}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <TrendingUpIcon color="success" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    sx={{ mt: 3, mb: 2, fontWeight: 700 }}
                                >
                                    Credit Account
                                </Button>
                            </form>
                        </TabPanel>
                        <TabPanel value={tabValue} index={1}>
                            <Typography variant="h6" fontWeight={600} gutterBottom color="primary.main">
                                Debit Account
                            </Typography>
                            <form onSubmit={debitFormik.handleSubmit}>
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    id="accountNumber"
                                    name="accountNumber"
                                    label="Account Number"
                                    value={debitFormik.values.accountNumber}
                                    onChange={debitFormik.handleChange}
                                    error={
                                        debitFormik.touched.accountNumber &&
                                        Boolean(debitFormik.errors.accountNumber)
                                    }
                                    helperText={
                                        debitFormik.touched.accountNumber && debitFormik.errors.accountNumber
                                    }
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <AccountCircleIcon color="primary" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    id="amount"
                                    name="amount"
                                    label="Amount"
                                    type="number"
                                    value={debitFormik.values.amount}
                                    onChange={debitFormik.handleChange}
                                    error={debitFormik.touched.amount && Boolean(debitFormik.errors.amount)}
                                    helperText={debitFormik.touched.amount && debitFormik.errors.amount}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <TrendingDownIcon color="error" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    sx={{ mt: 3, mb: 2, fontWeight: 700 }}
                                >
                                    Debit Account
                                </Button>
                            </form>
                        </TabPanel>
                        <TabPanel value={tabValue} index={2}>
                            <Typography variant="h6" fontWeight={600} gutterBottom color="primary.main">
                                Transfer Funds
                            </Typography>
                            <form onSubmit={transferFormik.handleSubmit}>
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    id="sourceAccountNumber"
                                    name="sourceAccountNumber"
                                    label="Source Account Number"
                                    value={transferFormik.values.sourceAccountNumber}
                                    onChange={transferFormik.handleChange}
                                    error={
                                        transferFormik.touched.sourceAccountNumber &&
                                        Boolean(transferFormik.errors.sourceAccountNumber)
                                    }
                                    helperText={
                                        transferFormik.touched.sourceAccountNumber &&
                                        transferFormik.errors.sourceAccountNumber
                                    }
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <AccountCircleIcon color="primary" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    id="destinationAccountNumber"
                                    name="destinationAccountNumber"
                                    label="Destination Account Number"
                                    value={transferFormik.values.destinationAccountNumber}
                                    onChange={transferFormik.handleChange}
                                    error={
                                        transferFormik.touched.destinationAccountNumber &&
                                        Boolean(transferFormik.errors.destinationAccountNumber)
                                    }
                                    helperText={
                                        transferFormik.touched.destinationAccountNumber &&
                                        transferFormik.errors.destinationAccountNumber
                                    }
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <AccountCircleIcon color="primary" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    id="amount"
                                    name="amount"
                                    label="Amount"
                                    type="number"
                                    value={transferFormik.values.amount}
                                    onChange={transferFormik.handleChange}
                                    error={
                                        transferFormik.touched.amount && Boolean(transferFormik.errors.amount)
                                    }
                                    helperText={transferFormik.touched.amount && transferFormik.errors.amount}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SwapHorizIcon color="primary" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    sx={{ mt: 3, mb: 2, fontWeight: 700 }}
                                >
                                    Transfer Funds
                                </Button>
                            </form>
                        </TabPanel>
                    </Stack>
                </Paper>
            </Fade>
        </Container>
    );
};

export default Transactions; 