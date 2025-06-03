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
} from '@mui/material';
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
        <Container maxWidth="sm">
            <Paper sx={{ mt: 4 }}>
                <Tabs value={tabValue} onChange={handleTabChange} centered>
                    <Tab label="Credit Account" />
                    <Tab label="Debit Account" />
                    <Tab label="Transfer Funds" />
                </Tabs>

                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                        {success}
                    </Alert>
                )}

                <TabPanel value={tabValue} index={0}>
                    <Typography variant="h6" gutterBottom>
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
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Credit Account
                        </Button>
                    </form>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <Typography variant="h6" gutterBottom>
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
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Debit Account
                        </Button>
                    </form>
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                    <Typography variant="h6" gutterBottom>
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
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Transfer Funds
                        </Button>
                    </form>
                </TabPanel>
            </Paper>
        </Container>
    );
};

export default Transactions; 