package com.carvo.api.service;

import com.carvo.api.dto.checkrecord.CheckRecordResponse;
import com.carvo.api.dto.checkrecord.CreateCheckRecordRequest;
import com.carvo.api.entity.Booking;
import com.carvo.api.entity.CheckRecord;
import com.carvo.api.entity.Payment;
import com.carvo.api.entity.User;
import com.carvo.api.entity.Vehicle;
import com.carvo.api.entity.enums.BookingStatus;
import com.carvo.api.entity.enums.CheckType;
import com.carvo.api.entity.enums.PaymentStatus;
import com.carvo.api.entity.enums.Role;
import com.carvo.api.entity.enums.VehicleStatus;
import com.carvo.api.exception.BadRequestException;
import com.carvo.api.exception.ConflictException;
import com.carvo.api.exception.NotFoundException;
import com.carvo.api.repository.CheckRecordRepository;
import com.carvo.api.repository.PaymentRepository;
import com.carvo.api.repository.UserRepository;
import com.carvo.api.repository.VehicleRepository;
import com.carvo.api.security.CarvoUserPrincipal;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CheckRecordService {

    private final CheckRecordRepository checkRecordRepository;
    private final BookingService bookingService;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;

    public CheckRecordService(
            CheckRecordRepository checkRecordRepository,
            BookingService bookingService,
            VehicleRepository vehicleRepository,
            UserRepository userRepository,
            PaymentRepository paymentRepository) {
        this.checkRecordRepository = checkRecordRepository;
        this.bookingService = bookingService;
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional
    public CheckRecordResponse create(Long bookingId, Long staffId, CreateCheckRecordRequest request) {
        CheckType type;
        try {
            type = CheckType.valueOf(request.type().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid check-record type: " + request.type());
        }

        Booking booking = bookingService.findEntity(bookingId);
        Vehicle vehicle = booking.getVehicle();

        if (type == CheckType.CHECK_OUT) {
            if (booking.getStatus() != BookingStatus.CONFIRMED) {
                throw new ConflictException("Vehicle can only be checked out for a confirmed booking.");
            }
            Payment payment = paymentRepository.findByBookingId(booking.getId()).orElse(null);
            if (payment == null || payment.getStatus() != PaymentStatus.COMPLETED) {
                throw new ConflictException(
                        "Vehicle cannot be checked out until staff has verified payment for this booking.");
            }
            booking.setStatus(BookingStatus.ONGOING);
            vehicle.setStatus(VehicleStatus.RENTED);
        } else {
            if (booking.getStatus() != BookingStatus.ONGOING) {
                throw new ConflictException("Vehicle can only be checked in for an ongoing rental.");
            }
            booking.setStatus(BookingStatus.COMPLETED);
            vehicle.setStatus(VehicleStatus.AVAILABLE);
        }

        User staff = userRepository.findById(staffId).orElseThrow(() -> new NotFoundException("User not found"));

        CheckRecord record = new CheckRecord();
        record.setBooking(booking);
        record.setStaff(staff);
        record.setType(type);
        record.setOdometerReading(request.odometerReading());
        record.setConditionNotes(request.conditionNotes());
        record.setExtraCharges(request.extraCharges() != null ? request.extraCharges() : BigDecimal.ZERO);

        vehicleRepository.save(vehicle);
        CheckRecord saved = checkRecordRepository.save(record);
        return CheckRecordResponse.from(saved);
    }

    public List<CheckRecordResponse> findByBooking(CarvoUserPrincipal principal, Long bookingId) {
        Booking booking = bookingService.findEntity(bookingId);
        boolean isOwner = booking.getCustomer().getId().equals(principal.getId());
        if (!isOwner && principal.getUser().getRole() == Role.CUSTOMER) {
            throw new AccessDeniedException("You do not have permission to view these records.");
        }
        return checkRecordRepository.findByBookingId(bookingId).stream()
                .map(CheckRecordResponse::from)
                .toList();
    }

    public List<CheckRecordResponse> findAll() {
        return checkRecordRepository.findAllByOrderByRecordedAtDesc().stream()
                .map(CheckRecordResponse::from)
                .toList();
    }
}
