package com.carvo.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.carvo.api.entity.Vehicle;
import com.carvo.api.entity.enums.VehicleStatus;
import com.carvo.api.exception.BadRequestException;
import com.carvo.api.exception.NotFoundException;
import com.carvo.api.repository.BranchRepository;
import com.carvo.api.repository.VehicleImageRepository;
import com.carvo.api.repository.VehicleRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class VehicleServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private VehicleImageRepository vehicleImageRepository;

    @Mock
    private BranchRepository branchRepository;

    private VehicleService vehicleService;

    @BeforeEach
    void setUp() {
        vehicleService = new VehicleService(vehicleRepository, vehicleImageRepository, branchRepository);
    }

    @Test
    void updateStatus_validStatus_updatesAndReturnsVehicle() {
        Vehicle vehicle = new Vehicle();
        vehicle.setStatus(VehicleStatus.AVAILABLE);
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));
        when(vehicleRepository.save(any(Vehicle.class))).thenAnswer(inv -> inv.getArgument(0));
        when(vehicleImageRepository.findByVehicleId(any())).thenReturn(List.of());

        var response = vehicleService.updateStatus(1L, "maintenance");

        assertThat(response.status()).isEqualTo("MAINTENANCE");
        assertThat(vehicle.getStatus()).isEqualTo(VehicleStatus.MAINTENANCE);
    }

    @Test
    void updateStatus_invalidStatus_throwsBadRequest() {
        Vehicle vehicle = new Vehicle();
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));

        assertThatThrownBy(() -> vehicleService.updateStatus(1L, "PARKED"))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void updateStatus_unknownVehicle_throwsNotFound() {
        when(vehicleRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> vehicleService.updateStatus(99L, "MAINTENANCE"))
                .isInstanceOf(NotFoundException.class);
    }
}
