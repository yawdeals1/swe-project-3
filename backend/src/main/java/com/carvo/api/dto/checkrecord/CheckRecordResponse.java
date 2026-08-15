package com.carvo.api.dto.checkrecord;

import com.carvo.api.entity.CheckRecord;
import java.math.BigDecimal;
import java.time.Instant;

public record CheckRecordResponse(
        Long id,
        Long bookingId,
        Long staffId,
        String staffName,
        String type,
        Integer odometerReading,
        String conditionNotes,
        BigDecimal extraCharges,
        Instant recordedAt) {

    public static CheckRecordResponse from(CheckRecord record) {
        return new CheckRecordResponse(
                record.getId(),
                record.getBooking().getId(),
                record.getStaff().getId(),
                record.getStaff().getName(),
                record.getType().name(),
                record.getOdometerReading(),
                record.getConditionNotes(),
                record.getExtraCharges(),
                record.getRecordedAt());
    }
}
