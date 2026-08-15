package com.carvo.api.dto.admin;

import java.math.BigDecimal;

public record DashboardResponse(
        long totalVehicles,
        long availableVehicles,
        long activeBookings,
        long pendingBookings,
        double utilizationRate,
        BigDecimal totalRevenue) {
}
