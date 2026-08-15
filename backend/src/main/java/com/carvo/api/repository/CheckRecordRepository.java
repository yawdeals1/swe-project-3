package com.carvo.api.repository;

import com.carvo.api.entity.CheckRecord;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CheckRecordRepository extends JpaRepository<CheckRecord, Long> {

    List<CheckRecord> findByBookingId(Long bookingId);

    List<CheckRecord> findAllByOrderByRecordedAtDesc();
}
