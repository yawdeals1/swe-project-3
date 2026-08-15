package com.carvo.api.dto.payment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreatePaymentRequest(
        @NotNull(message = "Booking is required") Long bookingId,
        @NotBlank(message = "Payment method is required") String method) {
}
