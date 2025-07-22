
package com.bankapp.services;

import com.bankapp.dto.*;

public interface UserService {
	BankResponse createAcccount(UserDTO userDTO);

	BankResponse balanceEnquiry(EnquiryRequest request);

	String nameEnquiry(EnquiryRequest request);

	BankResponse creditAccount(CreditDebitRequest request);

	BankResponse debitAccount(CreditDebitRequest request);

	BankResponse transfer(TransferRequest request);

	BankResponse login(LoginDto loginDto);

	// Profile endpoints
	UserDTO getProfile(String email);

	UserDTO updateProfile(String email, UserDTO userDTO);

	// Password change
	BankResponse changePassword(String email, ChangePasswordRequest request);

	// Loan feature
	LoanDTO applyLoan(String userEmail, LoanDTO loanDTO);

	java.util.List<LoanDTO> getLoans(String userEmail);

	// For analytics: get all transactions for a user
	java.util.List<TransactionDTO> getAllTransactionsForUser(String email);
}