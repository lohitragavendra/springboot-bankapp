import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Link,
    Alert,
    Avatar,
    Fade,
    Stack,
    useTheme,
    useMediaQuery,
    InputAdornment,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useFormik } from 'formik';
import * as yup from 'yup';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';

const validationSchema = yup.object({
    email: yup
        .string()
        .email('Enter a valid email')
        .required('Email is required'),
    password: yup
        .string()
        .min(5, 'Password should be of minimum 6 characters length')
        .required('Password is required'),
});

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = useState<string | null>(null);

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            try {
                await login(values.email, values.password);
                navigate('/');
            } catch (err) {
                setError('Invalid email or password');
            }
        },
    });

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    return (
        <Container component="main" maxWidth="xs" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Fade in timeout={600}>
                <Paper elevation={6} sx={{ p: isMobile ? 3 : 5, borderRadius: 5, width: '100%', boxShadow: 8 }}>
                    <Stack spacing={3} alignItems="center">
                        <Avatar sx={{ bgcolor: 'primary.main', width: 72, height: 72 }}>
                            <AccountBalanceIcon fontSize="large" />
                        </Avatar>
                        <Typography component="h1" variant="h5" fontWeight={700} color="primary.main">
                            Welcome Back
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
                            Sign in to your bank account
                        </Typography>
                        {error && (
                            <Alert severity="error" sx={{ width: '100%' }}>
                                {error}
                            </Alert>
                        )}
                        <Box
                            component="form"
                            onSubmit={formik.handleSubmit}
                            sx={{ width: '100%' }}
                        >
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                error={formik.touched.email && Boolean(formik.errors.email)}
                                helperText={formik.touched.email && formik.errors.email}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon color="primary" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                error={formik.touched.password && Boolean(formik.errors.password)}
                                helperText={formik.touched.password && formik.errors.password}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon color="primary" />
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
                                Sign In
                            </Button>
                            <Box sx={{ textAlign: 'center' }}>
                                <Link href="/register" variant="body2">
                                    {"Don't have an account? Sign Up"}
                                </Link>
                            </Box>
                        </Box>
                    </Stack>
                </Paper>
            </Fade>
        </Container>
    );
};

export default Login; 