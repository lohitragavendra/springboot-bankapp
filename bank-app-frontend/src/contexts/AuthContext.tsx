import React, { createContext, useContext, useState, useEffect } from 'react';
import { userService } from '../services/api';
import { BankResponse } from '../types';

interface AuthContextType {
    isAuthenticated: boolean;
    user: BankResponse | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<BankResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            console.log('Starting login process...');
            const response = await userService.login({ email, password });
            console.log('Login response received:', response);

            // Store account number if available
            if (response.accountInfo?.accountNumber) {
                console.log('Storing account number:', response.accountInfo.accountNumber);
                localStorage.setItem('accountNumber', response.accountInfo.accountNumber);
            }

            // Verify token is stored
            const storedToken = localStorage.getItem('token');
            console.log('Stored token:', storedToken);
            console.log('Token length:', storedToken?.length);
            console.log('Token format:', storedToken?.split('.').length === 3 ? 'Valid JWT format' : 'Invalid JWT format');

            // Update authentication state
            setIsAuthenticated(true);
            setUser(response);
            console.log('Login process completed successfully');
        } catch (error: any) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 