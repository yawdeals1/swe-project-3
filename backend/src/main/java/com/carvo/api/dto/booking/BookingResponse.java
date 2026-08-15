package com.carvo.api.dto.booking;

import com.carvo.api.entity.Booking;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record BookingResponse(
        Long id,
        Long customerId,
        String customerName,
        Long vehicleId,
        String vehicleLabel,
        Long confirmedByStaffId,
        LocalDate startDate,
        LocalDate endDate,
        String status,
        BigDecimal totalAmount,
        Instant createdAt) {

    public static BookingResponse from(Booking booking) {
        return new BookingResponse(
                booking.getId(),
                booking.getCustomer().getId(),
                booking.getCustomer().getName(),
                booking.getVehicle().getId(),
                booking.getVehicle().getMake() + " " + booking.getVehicle().getModel(),
                booking.getConfirmedByStaff() != null ? booking.getConfirmedByStaff().getId() : null,
                booking.getStartDate(),
                booking.getEndDate(),
                booking.getStatus().name(),
                booking.getTotalAmount(),
                booking.getCreatedAt());
    }
}
