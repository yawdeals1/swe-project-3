package com.carvo.api.repository;

import com.carvo.api.entity.Payment;
import java.math.BigDecimal;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByBookingId(Long bookingId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = com.carvo.api.entity.enums.PaymentStatus.COMPLETED")
    BigDecimal sumCompletedRevenue();
}
