// ...existing code...
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
    console.log('Token from localStorage:', token);

    if (!token) {
        console.warn('No token found in localStorage');
        return config;
    }

    // Validate token format
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
        console.error('Invalid token format');
        return config;
    }

    // Add token to headers with 'Bearer ' prefix
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Request headers:', {
        ...config.headers,
        Authorization: `Bearer ${token.substring(0, 20)}...` // Log only part of the token for security
    });
    return config;
}, (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
});

// Add response interceptor for better error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('Response error:', {
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers,
            config: {
                url: error.config?.url,
                method: error.config?.method,
                headers: {
                    ...error.config?.headers,
                    Authorization: error.config?.headers?.Authorization ?
                        `${error.config.headers.Authorization.substring(0, 20)}...` :
                        undefined
                }
            }
        });

        // Handle different error cases
        if (error.response?.status === 401) {
            console.log('Authentication error - redirecting to login');
            localStorage.removeItem('token');
            window.location.href = '/login';
        } else if (error.response?.status === 403) {
            console.log('Authorization error - token might be invalid');
            // Try to refresh the token or handle the error
            const token = localStorage.getItem('token');
            if (token) {
                console.log('Current token:', token.substring(0, 20) + '...');
                // Try to decode the token to check its contents
                try {
                    const base64Url = token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));
                    console.log('Token payload:', JSON.parse(jsonPayload));
                } catch (e) {
                    console.error('Error decoding token:', e);
                }
            }
        }
        return Promise.reject(error);
    }
);

export const userService = {
    getTransactions: async (): Promise<Transaction[]> => {
        const response = await api.get('/api/user/transactions');
        // Adjust if your backend returns a different structure
        return response.data.transactions || response.data || [];
    },
    getProfile: async (): Promise<UserDTO> => {
        const response = await api.get('/api/user/profile');
        return response.data;
    },

    updateProfile: async (userData: Partial<UserDTO>): Promise<UserDTO> => {
        const response = await api.put('/api/user/profile', userData);
        return response.data;
    },
    createAccount: async (userData: UserDTO): Promise<BankResponse> => {
        const response = await api.post('/api/user', userData);
        return response.data;
    },

    login: async (loginData: LoginDto): Promise<BankResponse> => {
        try {
            console.log('Sending login request:', loginData);
            const response = await api.post('/api/user/login', loginData);
            console.log('Login response:', response.data);

            // Handle the response data
            const responseData = response.data;

            // Extract token from response
            let token: string;
            if (typeof responseData === 'string') {
                token = responseData;
            } else if (responseData.token) {
                token = responseData.token;
            } else if (responseData.responseMessage && responseData.responseCode === 'Login Success') {
                token = responseData.responseMessage;
            } else {
                throw new Error('No token found in response');
            }

            // Create the response object
            const bankResponse: BankResponse = {
                responseCode: '00',
                responseMessage: 'Login successful',
                token: token,
                accountInfo: responseData.accountInfo || {}
            };

            // Store token immediately
            localStorage.setItem('token', token);

            return bankResponse;
        } catch (error: any) {
            console.error('Login error:', error);
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    },

    changePassword: async (oldPassword: string, newPassword: string): Promise<{responseCode: string, responseMessage: string}> => {
        const response = await api.post('/api/user/changePassword', { oldPassword, newPassword });
        return response.data;
    },

    balanceEnquiry: async (request: EnquiryRequest): Promise<BankResponse> => {
        console.log('Sending balance enquiry request:', request);
        try {
            const response = await api.post('/api/user/balanceEnquiry', request);
            console.log('Raw balance enquiry response:', response);
            console.log('Response data:', response.data);
            console.log('Response data type:', typeof response.data);
            console.log('Response data structure:', JSON.stringify(response.data, null, 2));

            // Handle different response formats
            let balanceResponse: BankResponse;
            if (typeof response.data === 'string') {
                balanceResponse = {
                    responseCode: '00',
                    responseMessage: 'Success',
                    accountInfo: {
                        accountBalance: parseFloat(response.data)
                    }
                };
            } else if (response.data && typeof response.data === 'object') {
                balanceResponse = {
                    responseCode: response.data.responseCode || '00',
                    responseMessage: response.data.responseMessage || 'Success',
                    accountInfo: {
                        accountBalance: response.data.accountBalance || response.data.accountInfo?.accountBalance,
                        accountNumber: request.accountNumber
                    }
                };
            } else {
                throw new Error('Unexpected response format');
            }

            console.log('Processed balance response:', balanceResponse);
            return balanceResponse;
        } catch (error: any) {
            console.error('Balance enquiry error:', error);
            console.error('Error response:', error.response?.data);
            throw error;
        }
    },

    nameEnquiry: async (request: EnquiryRequest): Promise<string> => {
        console.log('Sending name enquiry request:', request);
        const response = await api.post('/api/user/nameEnquiry', request);
        console.log('Name enquiry response:', response.data);
        return response.data;
    },

    creditAccount: async (request: CreditDebitRequest): Promise<BankResponse> => {
        const response = await api.post('/api/user/credit', request);
        return response.data;
    },

    debitAccount: async (request: CreditDebitRequest): Promise<BankResponse> => {
        const response = await api.post('/api/user/debit', request);
        return response.data;
    },

    transfer: async (request: TransferRequest): Promise<BankResponse> => {
        const response = await api.post('/api/user/transfer', request);
        return response.data;
    },

    getBankStatement: async (data: { accountNumber: string; startDate: string; endDate: string }): Promise<any> => {
        try {
            console.log('Making getBankStatement request:', data);
            const response = await api.get('/bankStatement', {
                params: data
            });
            console.log('Raw getBankStatement response:', response);
            console.log('Response data:', response.data);
            console.log('Response data type:', typeof response.data);
            console.log('Response data structure:', JSON.stringify(response.data, null, 2));

            if (!response.data) {
                console.warn('No data in response');
                return [];
            }

            // Handle different response formats
            if (Array.isArray(response.data)) {
                console.log('Response is an array of transactions');
                return response.data;
            }

            if (response.data.transactions && Array.isArray(response.data.transactions)) {
                console.log('Response contains transactions array');
                return response.data.transactions;
            }

            if (response.data.data?.transactions && Array.isArray(response.data.data.transactions)) {
                console.log('Response contains nested transactions array');
                return response.data.data.transactions;
            }

            console.warn('Unexpected response format:', response.data);
            return [];
        } catch (error: any) {
            console.error('Error in getBankStatement:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw error;
        }
    },

    getRecentTransactions: async (data: { accountNumber: string }): Promise<any> => {
        try {
            console.log('Making getRecentTransactions request:', data);
            const response = await api.post('/api/transactions/recent', data);
            console.log('Raw getRecentTransactions response:', response);
            console.log('Response data:', response.data);
            console.log('Response data type:', typeof response.data);
            console.log('Response data structure:', JSON.stringify(response.data, null, 2));

            if (!response.data) {
                console.warn('No data in response');
                return [];
            }

            // Handle different response formats
            if (Array.isArray(response.data)) {
                console.log('Response is an array of transactions');
                return response.data;
            }

            if (response.data.transactions && Array.isArray(response.data.transactions)) {
                console.log('Response contains transactions array');
                return response.data.transactions;
            }

            if (response.data.data?.transactions && Array.isArray(response.data.data.transactions)) {
                console.log('Response contains nested transactions array');
                return response.data.data.transactions;
            }

            console.warn('Unexpected response format:', response.data);
            return [];
        } catch (error: any) {
            console.error('Error in getRecentTransactions:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw error;
        }
    },
    applyLoan: async (data: { type: string; amount: number }) => {
        return api.post('/api/user/loan/apply', data).then(res => res.data);
    },
    getLoans: async (): Promise<any[]> => {
        return api.get('/api/user/loans').then(res => res.data);
    }
};