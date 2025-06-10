package com.bankapp.controller;

import com.bankapp.dto.*;
import com.bankapp.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

     @Autowired
    UserService userService;

     @PostMapping
     public BankResponse createAccount(@RequestBody UserDTO userRequest){
         return userService.createAcccount(userRequest);
     }
     
     @PostMapping("/login")
     public BankResponse login(@RequestBody LoginDto loginDto) {
    	 return userService.login(loginDto);
     }

     @PostMapping("balanceEnquiry")
     public BankResponse balanceEnquiry(@RequestBody EnquiryRequest request){
         return userService.balanceEnquiry(request);
     }

     @PostMapping("nameEnquiry")
     public String nameEnquiry(@RequestBody EnquiryRequest request) {
         return userService.nameEnquiry(request);
     }

    @PostMapping("credit")
    public BankResponse creditAccount(@RequestBody CreditDebitRequest request){
        return userService.creditAccount(request);
    }

    @PostMapping("debit")
    public BankResponse debitAccount(@RequestBody CreditDebitRequest request){
        return userService.debitAccount(request);
    }

    @PostMapping("transfer")
    public BankResponse transfer(@RequestBody TransferRequest request){
         return userService.transfer(request);
    }


}
