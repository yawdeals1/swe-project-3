package com.carvo.api.dto.booking;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CreateBookingRequest(
        @NotNull(message = "Vehicle is required") Long vehicleId,
        @NotNull(message = "Start date is required") @FutureOrPresent(message = "Start date must not be in the past")
                LocalDate startDate,
        @NotNull(message = "End date is required") LocalDate endDate) {
}
