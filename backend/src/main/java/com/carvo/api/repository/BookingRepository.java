package com.carvo.api.repository;

import com.carvo.api.entity.Booking;
import com.carvo.api.entity.enums.BookingStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByCustomerId(Long customerId);

    List<Booking> findByVehicleId(Long vehicleId);

    List<Booking> findByStatus(BookingStatus status);

    long countByStatusIn(List<BookingStatus> statuses);
}
