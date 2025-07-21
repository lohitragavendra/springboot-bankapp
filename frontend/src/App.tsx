import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';





import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import BankStatement from './pages/BankStatement';
import Profile from './pages/Profile';
import BudgetingAnalytics from './pages/BudgetingAnalytics';
import Sidebar from './components/Sidebar';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <div>Loading...</div>;
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function AppContent() {
  const { isAuthenticated } = useAuth();
  const currentPath = window.location.pathname;
  const showSidebar = isAuthenticated && currentPath !== '/login' && currentPath !== '/register';
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {showSidebar && <Sidebar />}
      <Box sx={{ flex: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <PrivateRoute>
                <Transactions />
              </PrivateRoute>
            }
          />
          <Route
            path="/statement"
            element={
              <PrivateRoute>
                <BankStatement />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/budgeting-analytics"
            element={
              <PrivateRoute>
                <BudgetingAnalytics />
              </PrivateRoute>
            }
          />
        </Routes>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={require('./theme').default}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
