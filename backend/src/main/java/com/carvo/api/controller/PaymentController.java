package com.carvo.api.controller;

import com.carvo.api.dto.payment.CreatePaymentRequest;
import com.carvo.api.dto.payment.PaymentResponse;
import com.carvo.api.security.CarvoUserPrincipal;
import com.carvo.api.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PaymentResponse> pay(
            @AuthenticationPrincipal CarvoUserPrincipal principal,
            @Valid @RequestBody CreatePaymentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.pay(principal.getId(), request));
    }

    @GetMapping("/booking/{bookingId}")
    public PaymentResponse getByBooking(
            @AuthenticationPrincipal CarvoUserPrincipal principal,
            @PathVariable Long bookingId) {
        return paymentService.getByBooking(principal, bookingId);
    }

    @PostMapping("/{id}/verify")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public PaymentResponse verify(@PathVariable Long id) {
        return paymentService.verify(id);
    }
}
