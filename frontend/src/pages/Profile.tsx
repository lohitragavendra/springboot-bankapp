import React, { useState, useRef, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Avatar,
    Button,
    TextField,
    Stack,
    Divider,
    Switch,
    FormControlLabel,
    Snackbar,
    Alert,
    useTheme,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/api';
import { Edit, Save, PhotoCamera } from '@mui/icons-material';

const Profile: React.FC = () => {
    const theme = useTheme();
    const { user, setUser } = useAuth();
    const [editMode, setEditMode] = useState(false);
    const [profilePic, setProfilePic] = useState<string | undefined>(localStorage.getItem('profilePic') || undefined);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [notifEmail, setNotifEmail] = useState(true);
    const [notifSMS, setNotifSMS] = useState(false);
    const [notifApp, setNotifApp] = useState(true);
    const [darkMode, setDarkMode] = useState(theme.palette.mode === 'dark');
    const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success'|'error'}>({open: false, message: '', severity: 'success'});
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch profile from backend on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profile = await userService.getProfile();
                setName(profile.firstName + (profile.lastName ? ' ' + profile.lastName : ''));
                setEmail(profile.email || '');
                setPhone(profile.phoneNumber || '');
                // Notification preferences: parse CSV string
                const prefs = (profile.notificationPreferences || '').split(',');
                setNotifEmail(prefs.includes('email'));
                setNotifSMS(prefs.includes('sms'));
                setNotifApp(prefs.includes('push'));
                setDarkMode(!!profile.darkMode);
            } catch (e) {
                setSnackbar({open: true, message: 'Failed to load profile', severity: 'error'});
            }
        };
        fetchProfile();
    }, []);

    const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const pic = ev.target?.result as string;
                setProfilePic(pic);
                localStorage.setItem('profilePic', pic);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSave = async () => {
        try {
            // Compose notification preferences as CSV
            const notificationPreferences = [
                notifEmail ? 'email' : null,
                notifSMS ? 'sms' : null,
                notifApp ? 'push' : null
            ].filter(Boolean).join(',');
            // Split name into first/last
            const [firstName, ...rest] = name.split(' ');
            const lastName = rest.join(' ');
            const updated = await userService.updateProfile({
                firstName,
                lastName,
                email,
                phoneNumber: phone,
                notificationPreferences,
                darkMode
            });
            setEditMode(false);
            setSnackbar({open: true, message: 'Profile updated successfully!', severity: 'success'});
            // Optionally update user context
            setUser && setUser((prev) => prev ? {
                ...prev,
                accountInfo: {
                    ...prev.accountInfo,
                    accountName: updated.firstName + (updated.lastName ? ' ' + updated.lastName : ''),
                },
                // Optionally update other fields if needed
            } : prev);
        } catch (e) {
            setSnackbar({open: true, message: 'Failed to update profile', severity: 'error'});
        }
    };

    const handlePasswordChange = async () => {
        if (newPassword !== confirmPassword) {
            setSnackbar({open: true, message: 'Passwords do not match.', severity: 'error'});
            return;
        }
        try {
            const res = await userService.changePassword(oldPassword, newPassword);
            if (res.responseCode === '00') {
                setShowPasswordFields(false);
                setSnackbar({open: true, message: 'Password changed successfully!', severity: 'success'});
                setOldPassword(''); setNewPassword(''); setConfirmPassword('');
            } else {
                setSnackbar({open: true, message: res.responseMessage || 'Password change failed', severity: 'error'});
            }
        } catch (e: any) {
            setSnackbar({open: true, message: e?.response?.data?.responseMessage || 'Password change failed', severity: 'error'});
        }
    };

    const handleNotifChange = (type: 'email'|'sms'|'app') => (e: React.ChangeEvent<HTMLInputElement>) => {
        if (type === 'email') setNotifEmail(e.target.checked);
        if (type === 'sms') setNotifSMS(e.target.checked);
        if (type === 'app') setNotifApp(e.target.checked);
    };

    const handleDarkModeToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setDarkMode(e.target.checked);
        try {
            await userService.updateProfile({ darkMode: e.target.checked });
            setSnackbar({open: true, message: 'Appearance updated!', severity: 'success'});
            // Optionally update theme context/provider here
            // window.location.reload(); // Only if needed
        } catch (e) {
            setSnackbar({open: true, message: 'Failed to update appearance', severity: 'error'});
        }
    };

    return (
        <Container maxWidth="sm" sx={{ py: 6 }}>
            <Paper sx={{ p: 4, borderRadius: 5, boxShadow: 6 }}>
                <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>
                    Profile & Settings
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                    <Avatar src={profilePic} sx={{ width: 96, height: 96, mb: 1 }} />
                    <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        ref={fileInputRef}
                        onChange={handleProfilePicChange}
                    />
                    <Button
                        variant="outlined"
                        startIcon={<PhotoCamera />}
                        size="small"
                        onClick={() => fileInputRef.current?.click()}
                        sx={{ mt: 1 }}
                    >
                        Change Photo
                    </Button>
                </Box>
                <Stack spacing={2} mb={2}>
                    <TextField
                        label="Name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        disabled={!editMode}
                        fullWidth
                    />
                    <TextField
                        label="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        disabled={!editMode}
                        fullWidth
                    />
                    <TextField
                        label="Phone"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        disabled={!editMode}
                        fullWidth
                    />
                </Stack>
                <Box mb={2}>
                    {editMode ? (
                        <Button variant="contained" startIcon={<Save />} onClick={handleSave} sx={{ mr: 2 }}>
                            Save
                        </Button>
                    ) : (
                        <Button variant="outlined" startIcon={<Edit />} onClick={() => setEditMode(true)} sx={{ mr: 2 }}>
                            Edit Profile
                        </Button>
                    )}
                    <Button variant="text" color="secondary" onClick={() => setShowPasswordFields(v => !v)}>
                        Change Password
                    </Button>
                </Box>
                {showPasswordFields && (
                    <Stack spacing={2} mb={2}>
                        <TextField
                            label="Old Password"
                            type="password"
                            value={oldPassword}
                            onChange={e => setOldPassword(e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="New Password"
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="Confirm New Password"
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            fullWidth
                        />
                        <Button variant="contained" onClick={handlePasswordChange}>
                            Save Password
                        </Button>
                    </Stack>
                )}
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" fontWeight={600} gutterBottom>
                    Notification Preferences
                </Typography>
                <Stack direction="column" spacing={1} mb={2}>
                    <FormControlLabel
                        control={<Switch checked={notifEmail} onChange={handleNotifChange('email')} />}
                        label="Email Notifications"
                    />
                    <FormControlLabel
                        control={<Switch checked={notifSMS} onChange={handleNotifChange('sms')} />}
                        label="SMS Notifications"
                    />
                    <FormControlLabel
                        control={<Switch checked={notifApp} onChange={handleNotifChange('app')} />}
                        label="App Notifications"
                    />
                </Stack>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" fontWeight={600} gutterBottom>
                    Appearance
                </Typography>
                <FormControlLabel
                    control={<Switch checked={darkMode} onChange={handleDarkModeToggle} />}
                    label="Dark Mode"
                />
            </Paper>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Profile;
