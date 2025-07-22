import React from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Divider, Typography, Button } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PieChartIcon from '@mui/icons-material/PieChart';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { label: 'Profile', icon: <AccountCircleIcon />, path: '/profile' },
  { label: 'Budgeting & Analytics', icon: <PieChartIcon />, path: '/budgeting-analytics' },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  return (
    <Box sx={{ width: 250, bgcolor: 'background.paper', height: '100vh', borderRight: 1, borderColor: 'divider', pt: 2, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" align="center" fontWeight={700} color="primary" gutterBottom>
        BankApp
      </Typography>
      <Divider />
      <Box sx={{ flex: 1 }}>
        <List>
          {navItems.map((item) => (
            <ListItem
              button
              key={item.label}
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 2,
                my: 1,
                bgcolor: location.pathname === item.path ? 'primary.light' : 'inherit',
                color: location.pathname === item.path ? 'primary.main' : 'text.primary',
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
          <ListItem button component={Link} to="/loan-info">
            <ListItemIcon>
              <InfoIcon />
            </ListItemIcon>
            <ListItemText primary="Loan Info" />
          </ListItem>
        </List>
      </Box>
      <Box sx={{ pb: 2, px: 2 }}>
        <Button variant="outlined" color="error" fullWidth startIcon={<ExitToAppIcon />} onClick={() => {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }}>
          Logout
        </Button>
      </Box>
    </Box>
  );
}

export default Sidebar;
