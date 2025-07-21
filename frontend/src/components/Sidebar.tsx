import React from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Divider, Typography } from '@mui/material';
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
    <Box sx={{ width: 250, bgcolor: 'background.paper', height: '100vh', borderRight: 1, borderColor: 'divider', pt: 2 }}>
      <Typography variant="h5" align="center" fontWeight={700} color="primary" gutterBottom>
        BankApp
      </Typography>
      <Divider />
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
      </List>
    </Box>
  );
};

export default Sidebar;
