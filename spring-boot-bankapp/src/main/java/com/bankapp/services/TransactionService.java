package com.bankapp.services;

import com.bankapp.dto.TransactionDTO;

public interface TransactionService {
    void saveTransaction(TransactionDTO transactionDto);
}