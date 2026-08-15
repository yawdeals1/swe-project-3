package com.carvo.api.repository;

import com.carvo.api.entity.VehicleImage;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleImageRepository extends JpaRepository<VehicleImage, Long> {

    List<VehicleImage> findByVehicleId(Long vehicleId);
}
