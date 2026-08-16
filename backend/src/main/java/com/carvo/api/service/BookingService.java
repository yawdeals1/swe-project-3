package com.carvo.api.service;

import com.carvo.api.dto.booking.BookingResponse;
import com.carvo.api.dto.booking.CreateBookingRequest;
import com.carvo.api.entity.Booking;
import com.carvo.api.entity.User;
import com.carvo.api.entity.Vehicle;
import com.carvo.api.entity.enums.BookingStatus;
import com.carvo.api.exception.BadRequestException;
import com.carvo.api.exception.ConflictException;
import com.carvo.api.exception.NotFoundException;
import com.carvo.api.repository.BookingRepository;
import com.carvo.api.repository.UserRepository;
import com.carvo.api.repository.VehicleRepository;
import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

    public BookingService(
            BookingRepository bookingRepository,
            VehicleRepository vehicleRepository,
            UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
    }

    public BookingResponse create(Long customerId, CreateBookingRequest request) {
        if (request.endDate().isBefore(request.startDate())) {
            throw new BadRequestException("End date must not be before start date.");
        }
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        Vehicle vehicle = vehicleRepository.findById(request.vehicleId())
                .orElseThrow(() -> new NotFoundException("Vehicle not found"));

        long days = ChronoUnit.DAYS.between(request.startDate(), request.endDate()) + 1;
        BigDecimal totalAmount = vehicle.getDailyRate().multiply(BigDecimal.valueOf(days));

        Booking booking = new Booking();
        booking.setCustomer(customer);
        booking.setVehicle(vehicle);
        booking.setStartDate(request.startDate());
        booking.setEndDate(request.endDate());
        booking.setStatus(BookingStatus.PENDING);
        booking.setTotalAmount(totalAmount);
        return BookingResponse.from(bookingRepository.save(booking));
    }

    public List<BookingResponse> findByCustomer(Long customerId) {
        return bookingRepository.findByCustomerId(customerId).stream().map(BookingResponse::from).toList();
    }

    public List<BookingResponse> findAll(String status) {
        List<Booking> bookings = status != null
                ? bookingRepository.findByStatus(BookingStatus.valueOf(status.toUpperCase()))
                : bookingRepository.findAll();
        return bookings.stream().map(BookingResponse::from).toList();
    }

    public BookingResponse getById(Long id) {
        return BookingResponse.from(findEntity(id));
    }

    public Booking findEntity(Long id) {
        return bookingRepository.findById(id).orElseThrow(() -> new NotFoundException("Booking not found"));
    }

    public BookingResponse confirm(Long id, Long staffId) {
        Booking booking = findEntity(id);
        requireStatus(booking, BookingStatus.PENDING, "confirmed");
        User staff = userRepository.findById(staffId).orElseThrow(() -> new NotFoundException("User not found"));
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setConfirmedByStaff(staff);
        // Constraint violation here (booking_no_overlap) surfaces as a 409 via GlobalExceptionHandler,
        // which is the expected outcome for "these dates were taken by another confirmed booking".
        return BookingResponse.from(bookingRepository.save(booking));
    }

    public BookingResponse reject(Long id, Long staffId) {
        Booking booking = findEntity(id);
        requireStatus(booking, BookingStatus.PENDING, "rejected");
        booking.setStatus(BookingStatus.CANCELLED);
        return BookingResponse.from(bookingRepository.save(booking));
    }

    public BookingResponse cancel(Long bookingId, Long customerId) {
        Booking booking = findEntity(bookingId);
        if (!booking.getCustomer().getId().equals(customerId)) {
            throw new AccessDeniedException("You do not have permission to cancel this booking.");
        }
        requireStatus(booking, BookingStatus.PENDING, "cancelled");
        booking.setStatus(BookingStatus.CANCELLED);
        return BookingResponse.from(bookingRepository.save(booking));
    }

    private void requireStatus(Booking booking, BookingStatus expected, String action) {
        if (booking.getStatus() != expected) {
            throw new ConflictException(
                    "Booking cannot be " + action + " from status " + booking.getStatus());
        }
    }
}
