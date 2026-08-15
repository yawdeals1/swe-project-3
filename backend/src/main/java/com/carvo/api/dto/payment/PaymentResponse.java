package com.carvo.api.dto.payment;

import com.carvo.api.entity.Payment;
import java.math.BigDecimal;
import java.time.Instant;

public record PaymentResponse(
        Long id, Long bookingId, BigDecimal amount, String method, String status, Instant paidAt) {

    public static PaymentResponse from(Payment payment) {
        return new PaymentResponse(
                payment.getId(),
                payment.getBooking().getId(),
                payment.getAmount(),
                payment.getMethod(),
                payment.getStatus().name(),
                payment.getPaidAt());
    }
}
