package com.carvo.api.repository;

import com.carvo.api.entity.Availability;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AvailabilityRepository extends JpaRepository<Availability, Long> {

    List<Availability> findByVehicleId(Long vehicleId);
}
