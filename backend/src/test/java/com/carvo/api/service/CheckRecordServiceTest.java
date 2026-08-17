package com.carvo.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.carvo.api.dto.checkrecord.CheckRecordResponse;
import com.carvo.api.dto.checkrecord.CreateCheckRecordRequest;
import com.carvo.api.entity.Booking;
import com.carvo.api.entity.CheckRecord;
import com.carvo.api.entity.Payment;
import com.carvo.api.entity.User;
import com.carvo.api.entity.Vehicle;
import com.carvo.api.entity.enums.BookingStatus;
import com.carvo.api.entity.enums.PaymentStatus;
import com.carvo.api.entity.enums.VehicleStatus;
import com.carvo.api.exception.ConflictException;
import com.carvo.api.repository.CheckRecordRepository;
import com.carvo.api.repository.PaymentRepository;
import com.carvo.api.repository.UserRepository;
import com.carvo.api.repository.VehicleRepository;
import java.lang.reflect.Field;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CheckRecordServiceTest {

    @Mock
    private CheckRecordRepository checkRecordRepository;

    @Mock
    private BookingService bookingService;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PaymentRepository paymentRepository;

    private CheckRecordService checkRecordService;

    @BeforeEach
    void setUp() {
        checkRecordService = new CheckRecordService(
                checkRecordRepository, bookingService, vehicleRepository, userRepository, paymentRepository);
    }

    private Booking confirmedBooking() {
        Vehicle vehicle = new Vehicle();
        setId(vehicle, 3L);
        vehicle.setStatus(VehicleStatus.AVAILABLE);

        Booking booking = new Booking();
        setId(booking, 10L);
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setVehicle(vehicle);
        return booking;
    }

    @Test
    void checkOut_noPaymentRecorded_throwsConflictAndDoesNotReleaseVehicle() {
        Booking booking = confirmedBooking();
        when(bookingService.findEntity(10L)).thenReturn(booking);
        when(paymentRepository.findByBookingId(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> checkRecordService.create(
                        10L, 1L, new CreateCheckRecordRequest("CHECK_OUT", 1000, null, null)))
                .isInstanceOf(ConflictException.class);

        assertThat(booking.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
        assertThat(booking.getVehicle().getStatus()).isEqualTo(VehicleStatus.AVAILABLE);
    }

    @Test
    void checkOut_pendingUnverifiedPayment_throwsConflict() {
        Booking booking = confirmedBooking();
        Payment payment = new Payment();
        payment.setStatus(PaymentStatus.PENDING);

        when(bookingService.findEntity(10L)).thenReturn(booking);
        when(paymentRepository.findByBookingId(10L)).thenReturn(Optional.of(payment));

        assertThatThrownBy(() -> checkRecordService.create(
                        10L, 1L, new CreateCheckRecordRequest("CHECK_OUT", 1000, null, null)))
                .isInstanceOf(ConflictException.class);

        assertThat(booking.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
    }

    @Test
    void checkOut_verifiedPayment_succeedsAndReleasesVehicle() {
        Booking booking = confirmedBooking();
        Payment payment = new Payment();
        payment.setStatus(PaymentStatus.COMPLETED);

        User staff = new User();
        setId(staff, 1L);

        when(bookingService.findEntity(10L)).thenReturn(booking);
        when(paymentRepository.findByBookingId(10L)).thenReturn(Optional.of(payment));
        when(userRepository.findById(1L)).thenReturn(Optional.of(staff));
        when(vehicleRepository.save(any(Vehicle.class))).thenAnswer(inv -> inv.getArgument(0));
        when(checkRecordRepository.save(any(CheckRecord.class))).thenAnswer(inv -> inv.getArgument(0));

        CheckRecordResponse response = checkRecordService.create(
                10L, 1L, new CreateCheckRecordRequest("CHECK_OUT", 1000, "Clean", null));

        assertThat(response.type()).isEqualTo("CHECK_OUT");
        assertThat(booking.getStatus()).isEqualTo(BookingStatus.ONGOING);
        assertThat(booking.getVehicle().getStatus()).isEqualTo(VehicleStatus.RENTED);
    }

    private void setId(Object target, Long id) {
        try {
            Field field = target.getClass().getDeclaredField("id");
            field.setAccessible(true);
            field.set(target, id);
        } catch (ReflectiveOperationException ex) {
            throw new AssertionError("Unable to set id for test fixture", ex);
        }
    }
}
