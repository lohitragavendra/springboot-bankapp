export interface UserDTO {
    firstName: string;
    lastName: string;
    gender: string;
    address: string;
    state: string;
    email: string;
    password: string;
    phoneNumber: string;
    status: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface EnquiryRequest {
    accountNumber: string;
}

export interface CreditDebitRequest {
    accountNumber: string;
    amount: number;
}

export interface TransferRequest {
    sourceAccountNumber: string;
    destinationAccountNumber: string;
    amount: number;
}

export interface BankResponse {
    responseCode: string;
    responseMessage: string;
    token?: string;
    accountInfo?: {
        accountName: string;
        accountBalance: number;
        accountNumber: string;
    };
}

export interface Transaction {
    id: number;
    accountNumber: string;
    transactionType: string;
    amount: number;
    timestamp: string;
}

export interface BankStatementRequest {
    accountNumber: string;
    startDate: string;
    endDate: string;
} 