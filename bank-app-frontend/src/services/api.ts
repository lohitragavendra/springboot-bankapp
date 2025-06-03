import axios from 'axios';
import { UserDTO, LoginDto, EnquiryRequest, CreditDebitRequest, TransferRequest, BankResponse, Transaction, BankStatementRequest } from '../types';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add response interceptor for better error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized error (token expired or invalid)
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const userService = {
    createAccount: async (userData: UserDTO): Promise<BankResponse> => {
        const response = await api.post('/api/user', userData);
        return response.data;
    },

    login: async (loginData: LoginDto): Promise<BankResponse> => {
        try {
            console.log('Sending login request:', loginData);
            const response = await api.post('/api/user/login', loginData);
            console.log('Login response:', response.data);

            // If the response is a string (JWT token), convert it to a BankResponse
            if (typeof response.data === 'string') {
                const token = response.data;
                localStorage.setItem('token', token);
                return {
                    responseCode: '00',
                    responseMessage: 'Login successful',
                    token: token
                };
            }

            // If the response is already a BankResponse object
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }
            return response.data;
        } catch (error: any) {
            console.error('Login error details:', error);

            // If the error response contains a JWT token
            if (error.response?.data && typeof error.response.data === 'string') {
                const token = error.response.data;
                localStorage.setItem('token', token);
                return {
                    responseCode: '00',
                    responseMessage: 'Login successful',
                    token: token
                };
            }

            throw error;
        }
    },

    balanceEnquiry: async (request: EnquiryRequest): Promise<BankResponse> => {
        const response = await api.get('/api/user/balanceEnquiry', {
            params: request,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    },

    nameEnquiry: async (request: EnquiryRequest): Promise<string> => {
        const response = await api.get('/api/user/nameEnquiry', {
            params: request,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    },

    creditAccount: async (request: CreditDebitRequest): Promise<BankResponse> => {
        const response = await api.post('/api/user/credit', request, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    },

    debitAccount: async (request: CreditDebitRequest): Promise<BankResponse> => {
        const response = await api.post('/api/user/debit', request, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    },

    transfer: async (request: TransferRequest): Promise<BankResponse> => {
        const response = await api.post('/api/user/transfer', request, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    },

    getBankStatement: async (request: BankStatementRequest): Promise<Transaction[]> => {
        const response = await api.get('/bankStatement', {
            params: request,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }
}; 