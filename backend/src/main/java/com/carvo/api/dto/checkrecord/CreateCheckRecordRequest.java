package com.carvo.api.dto.checkrecord;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CreateCheckRecordRequest(
        @NotNull(message = "Type is required") String type,
        @NotNull(message = "Odometer reading is required") @Min(value = 0, message = "Odometer reading must be non-negative")
                Integer odometerReading,
        String conditionNotes,
        BigDecimal extraCharges) {
}
