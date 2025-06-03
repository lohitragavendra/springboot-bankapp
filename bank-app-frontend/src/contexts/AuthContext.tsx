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
            const response = await userService.login({ email, password });
            console.log('Login response:', response);

            // If we get here, the login was successful
            setIsAuthenticated(true);
            setUser({
                responseCode: '00',
                responseMessage: 'Login successful',
                token: localStorage.getItem('token') || undefined
            });
        } catch (error: any) {
            console.error('Login failed:', error);
            // If the error is a JWT token, it means login was successful
            if (typeof error === 'string' || (error.response?.data && typeof error.response.data === 'string')) {
                const token = typeof error === 'string' ? error : error.response.data;
                localStorage.setItem('token', token);
                setIsAuthenticated(true);
                setUser({
                    responseCode: '00',
                    responseMessage: 'Login successful',
                    token: token
                });
            } else {
                throw error;
            }
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