package com.carvo.api.repository;

import com.carvo.api.entity.Vehicle;
import java.math.BigDecimal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    boolean existsByPlateNumber(String plateNumber);

    @Query("""
        SELECT v FROM Vehicle v WHERE
        (:category IS NULL OR v.category = :category)
        AND (:minPrice IS NULL OR v.dailyRate >= :minPrice)
        AND (:maxPrice IS NULL OR v.dailyRate <= :maxPrice)
        """)
    java.util.List<Vehicle> searchWithoutDateRange(
            @Param("category") String category,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice);

    @Query("""
        SELECT v FROM Vehicle v WHERE
        (:category IS NULL OR v.category = :category)
        AND (:minPrice IS NULL OR v.dailyRate >= :minPrice)
        AND (:maxPrice IS NULL OR v.dailyRate <= :maxPrice)
        AND NOT EXISTS (
            SELECT b.id FROM Booking b
            WHERE b.vehicle = v
            AND b.status IN (com.carvo.api.entity.enums.BookingStatus.CONFIRMED, com.carvo.api.entity.enums.BookingStatus.ONGOING)
            AND b.startDate <= :endDate AND b.endDate >= :startDate
        )
        """)
    java.util.List<Vehicle> searchWithDateRange(
            @Param("category") String category,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("startDate") java.time.LocalDate startDate,
            @Param("endDate") java.time.LocalDate endDate);
}
