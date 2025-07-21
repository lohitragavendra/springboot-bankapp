
package com.bankapp.controller;

import com.bankapp.dto.*;
import com.bankapp.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/user")
public class UserController {
    // ...existing code...

    // Change password endpoint
    @PostMapping("/changePassword")
    public BankResponse changePassword(@RequestBody ChangePasswordRequest request, Principal principal) {
        String userEmail = principal.getName();
        return userService.changePassword(userEmail, request);
    }

    @Autowired
    UserService userService;

    // Get user profile by email (from Principal or param)
    @GetMapping("/profile")
    public UserDTO getProfile(Principal principal, @RequestParam(value = "email", required = false) String email) {
        String userEmail = email != null ? email : principal.getName();
        return userService.getProfile(userEmail);
    }

    // Update user profile
    @PutMapping("/profile")
    public UserDTO updateProfile(@RequestBody UserDTO userDTO, Principal principal) {
        String userEmail = principal.getName();
        return userService.updateProfile(userEmail, userDTO);
    }

    @PostMapping
    public BankResponse createAccount(@RequestBody UserDTO userRequest) {
        return userService.createAcccount(userRequest);
    }

    @PostMapping("/login")
    public BankResponse login(@RequestBody LoginDto loginDto) {
        return userService.login(loginDto);
    }

    @PostMapping("balanceEnquiry")
    public BankResponse balanceEnquiry(@RequestBody EnquiryRequest request) {
        return userService.balanceEnquiry(request);
    }

    @PostMapping("nameEnquiry")
    public String nameEnquiry(@RequestBody EnquiryRequest request) {
        return userService.nameEnquiry(request);
    }

    @PostMapping("credit")
    public BankResponse creditAccount(@RequestBody CreditDebitRequest request) {
        return userService.creditAccount(request);
    }

    @PostMapping("debit")
    public BankResponse debitAccount(@RequestBody CreditDebitRequest request) {
        return userService.debitAccount(request);
    }

    @PostMapping("transfer")
    public BankResponse transfer(@RequestBody TransferRequest request) {
        return userService.transfer(request);
    }

}
