package com.carvo.api.service;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import com.carvo.api.dto.booking.BookingResponse;
import com.carvo.api.entity.Booking;
import com.carvo.api.entity.User;
import com.carvo.api.entity.Vehicle;
import com.carvo.api.entity.enums.BookingStatus;
import com.carvo.api.exception.ConflictException;
import com.carvo.api.repository.BookingRepository;
import com.carvo.api.repository.UserRepository;
import com.carvo.api.repository.VehicleRepository;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private UserRepository userRepository;

    private BookingService bookingService;

    @BeforeEach
    void setUp() {
        bookingService = new BookingService(bookingRepository, vehicleRepository, userRepository);
    }

    @Test
    void cancel_validPendingBooking_updatesStatusAndReturnsResponse() {
        User customer = new User();
        setId(customer, 7L);
        customer.setName("Amani");

        Vehicle vehicle = new Vehicle();
        setId(vehicle, 9L);
        vehicle.setMake("Toyota");
        vehicle.setModel("Corolla");

        Booking booking = new Booking();
        booking.setCustomer(customer);
        booking.setVehicle(vehicle);
        booking.setStatus(BookingStatus.PENDING);
        booking.setStartDate(LocalDate.of(2026, 8, 20));
        booking.setEndDate(LocalDate.of(2026, 8, 22));
        booking.setTotalAmount(new BigDecimal("420.00"));

        when(bookingRepository.findById(10L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        BookingResponse response = bookingService.cancel(10L, 7L);

        assertThat(response.status()).isEqualTo("CANCELLED");
        assertThat(booking.getStatus()).isEqualTo(BookingStatus.CANCELLED);
    }

    @Test
    void cancel_nonOwner_throwsAccessDenied() {
        User customer = new User();
        setId(customer, 7L);

        Booking booking = new Booking();
        booking.setCustomer(customer);
        booking.setStatus(BookingStatus.PENDING);

        when(bookingRepository.findById(10L)).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.cancel(10L, 9L))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("You do not have permission to cancel this booking.");
    }

    @Test
    void cancel_nonPendingBooking_throwsConflict() {
        User customer = new User();
        setId(customer, 7L);

        Booking booking = new Booking();
        booking.setCustomer(customer);
        booking.setStatus(BookingStatus.CONFIRMED);

        when(bookingRepository.findById(10L)).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.cancel(10L, 7L))
                .isInstanceOf(ConflictException.class)
                .hasMessage("Booking cannot be cancelled from status CONFIRMED");
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
