package com.carvo.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.carvo.api.entity.Vehicle;
import com.carvo.api.entity.VehicleImage;
import com.carvo.api.entity.enums.VehicleStatus;
import com.carvo.api.exception.BadRequestException;
import com.carvo.api.exception.NotFoundException;
import com.carvo.api.repository.BranchRepository;
import com.carvo.api.repository.VehicleImageRepository;
import com.carvo.api.repository.VehicleRepository;
import com.carvo.api.storage.DeploroStorageClient;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class VehicleServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private VehicleImageRepository vehicleImageRepository;

    @Mock
    private BranchRepository branchRepository;

    @Mock
    private DeploroStorageClient storageClient;

    private VehicleService vehicleService;

    private static final byte[] PNG_BYTES = {
        (byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 13
    };
    private static final byte[] JPEG_BYTES = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0, 0};

    @BeforeEach
    void setUp() {
        vehicleService = new VehicleService(
                vehicleRepository, vehicleImageRepository, branchRepository, storageClient);
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

    @Test
    void search_withoutDates_usesQueryWithoutDateParameters() {
        when(vehicleRepository.searchWithoutDateRange("SUV", null, null)).thenReturn(List.of());

        vehicleService.search("SUV", null, null, null, null);

        verify(vehicleRepository).searchWithoutDateRange("SUV", null, null);
    }

    @Test
    void search_withDateRange_usesTypedDateQuery() {
        LocalDate start = LocalDate.of(2026, 8, 21);
        LocalDate end = LocalDate.of(2026, 8, 25);
        when(vehicleRepository.searchWithDateRange(null, null, null, start, end)).thenReturn(List.of());

        vehicleService.search(null, null, null, start, end);

        verify(vehicleRepository).searchWithDateRange(null, null, null, start, end);
    }

    @Test
    void search_withOnlyStartDate_filtersThatSingleDay() {
        LocalDate date = LocalDate.of(2026, 8, 21);
        when(vehicleRepository.searchWithDateRange(null, null, null, date, date)).thenReturn(List.of());

        vehicleService.search(null, null, null, date, null);

        verify(vehicleRepository).searchWithDateRange(null, null, null, date, date);
    }

    @Test
    void search_withOnlyEndDate_filtersThatSingleDay() {
        LocalDate date = LocalDate.of(2026, 8, 25);
        when(vehicleRepository.searchWithDateRange(null, null, null, date, date)).thenReturn(List.of());

        vehicleService.search(null, null, null, null, date);

        verify(vehicleRepository).searchWithDateRange(null, null, null, date, date);
    }

    @Test
    void addImage_uploadsToStorageUnderIdKeyAndNeverTouchesImageData() {
        Vehicle vehicle = new Vehicle();
        ReflectionTestUtils.setField(vehicle, "id", 4L);
        when(vehicleRepository.findById(4L)).thenReturn(Optional.of(vehicle));
        when(vehicleImageRepository.saveAndFlush(any(VehicleImage.class))).thenAnswer(inv -> {
            VehicleImage saved = inv.getArgument(0);
            ReflectionTestUtils.setField(saved, "id", 77L);
            return saved;
        });
        when(vehicleImageRepository.findByVehicleId(4L)).thenReturn(List.of());
        when(storageClient.upload(any(), any(), any())).thenAnswer(inv -> new DeploroStorageClient.StoredFile(
                inv.getArgument(0),
                "carvo/" + inv.getArgument(0),
                "https://api.deploro.com/files/carvo/" + inv.getArgument(0),
                inv.getArgument(2)));

        vehicleService.addImage(4L, new MockMultipartFile("file", "photo.png", "image/png", PNG_BYTES));

        verify(storageClient).upload(eq("vehicle-images/4/77.png"), any(), eq("image/png"));

        ArgumentCaptor<VehicleImage> captor = ArgumentCaptor.forClass(VehicleImage.class);
        verify(vehicleImageRepository).save(captor.capture());
        assertThat(captor.getValue().getImageUrl())
                .isEqualTo("https://api.deploro.com/files/carvo/vehicle-images/4/77.png");
        assertThat(captor.getValue().getImageData()).isNull();
    }

    /** The one pre-existing JPEG row is stored as ".jpg"; deriving the extension from the content
     *  type's subtype would write ".jpeg" and put new uploads on a second, conflicting convention. */
    @Test
    void addImage_jpeg_usesJpgExtensionNotJpeg() {
        Vehicle vehicle = new Vehicle();
        ReflectionTestUtils.setField(vehicle, "id", 3L);
        when(vehicleRepository.findById(3L)).thenReturn(Optional.of(vehicle));
        when(vehicleImageRepository.saveAndFlush(any(VehicleImage.class))).thenAnswer(inv -> {
            VehicleImage saved = inv.getArgument(0);
            ReflectionTestUtils.setField(saved, "id", 90L);
            return saved;
        });
        when(vehicleImageRepository.findByVehicleId(3L)).thenReturn(List.of());
        when(storageClient.upload(any(), any(), any())).thenAnswer(inv -> new DeploroStorageClient.StoredFile(
                inv.getArgument(0), "carvo/" + inv.getArgument(0), "https://example.test/x", inv.getArgument(2)));

        vehicleService.addImage(3L, new MockMultipartFile("file", "photo.jpg", "image/jpeg", JPEG_BYTES));

        verify(storageClient).upload(eq("vehicle-images/3/90.jpg"), any(), eq("image/jpeg"));
    }

    @Test
    void addImage_nonImageBytes_isRejectedBeforeReachingStorage() {
        Vehicle vehicle = new Vehicle();
        ReflectionTestUtils.setField(vehicle, "id", 4L);
        when(vehicleRepository.findById(4L)).thenReturn(Optional.of(vehicle));

        assertThatThrownBy(() -> vehicleService.addImage(
                        4L, new MockMultipartFile("file", "x.png", "image/png", "<svg/>".getBytes())))
                .isInstanceOf(BadRequestException.class);

        verifyNoInteractions(storageClient);
    }

    @Test
    void toResponse_prefersStoredUrlOverTheBlobProxyPath() {
        Vehicle vehicle = new Vehicle();
        ReflectionTestUtils.setField(vehicle, "id", 4L);
        VehicleImage image = new VehicleImage();
        ReflectionTestUtils.setField(image, "id", 11L);
        image.setImageUrl("https://api.deploro.com/files/carvo/vehicle-images/4/11.png");
        // Still populated, exactly as production is between this change and the blob drop.
        image.setImageData(PNG_BYTES);
        when(vehicleRepository.findById(4L)).thenReturn(Optional.of(vehicle));
        when(vehicleImageRepository.findByVehicleId(4L)).thenReturn(List.of(image));

        assertThat(vehicleService.getById(4L).imageUrls())
                .containsExactly("https://api.deploro.com/files/carvo/vehicle-images/4/11.png");
    }

    @Test
    void deleteImage_alsoRemovesTheStoredObject() {
        Vehicle vehicle = new Vehicle();
        ReflectionTestUtils.setField(vehicle, "id", 4L);
        VehicleImage image = new VehicleImage();
        ReflectionTestUtils.setField(image, "id", 11L);
        image.setVehicle(vehicle);
        image.setImageUrl("https://api.deploro.com/files/carvo/vehicle-images/4/11.png");
        when(vehicleRepository.findById(4L)).thenReturn(Optional.of(vehicle));
        when(vehicleImageRepository.findById(11L)).thenReturn(Optional.of(image));
        when(vehicleImageRepository.findByVehicleId(4L)).thenReturn(List.of());

        vehicleService.deleteImage(4L, 11L);

        verify(vehicleImageRepository).delete(image);
        verify(storageClient).deleteQuietly("https://api.deploro.com/files/carvo/vehicle-images/4/11.png");
    }
}
