package com.carvo.api.service;

import com.carvo.api.dto.payment.CreatePaymentRequest;
import com.carvo.api.dto.payment.PaymentResponse;
import com.carvo.api.entity.Booking;
import com.carvo.api.entity.Payment;
import com.carvo.api.entity.enums.BookingStatus;
import com.carvo.api.entity.enums.PaymentStatus;
import com.carvo.api.entity.enums.Role;
import com.carvo.api.exception.ConflictException;
import com.carvo.api.exception.NotFoundException;
import com.carvo.api.repository.PaymentRepository;
import com.carvo.api.security.CarvoUserPrincipal;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingService bookingService;

    public PaymentService(PaymentRepository paymentRepository, BookingService bookingService) {
        this.paymentRepository = paymentRepository;
        this.bookingService = bookingService;
    }

    public PaymentResponse pay(Long customerId, CreatePaymentRequest request) {
        Booking booking = bookingService.findEntity(request.bookingId());
        if (!booking.getCustomer().getId().equals(customerId)) {
            throw new AccessDeniedException("You can only pay for your own bookings.");
        }
        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new ConflictException("Payment can only be recorded for a confirmed booking.");
        }
        if (paymentRepository.findByBookingId(booking.getId()).isPresent()) {
            throw new ConflictException("This booking has already been paid for.");
        }

        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(booking.getTotalAmount());
        payment.setMethod(request.method());
        payment.setStatus(PaymentStatus.COMPLETED);
        return PaymentResponse.from(paymentRepository.save(payment));
    }

    public PaymentResponse getByBooking(CarvoUserPrincipal principal, Long bookingId) {
        Booking booking = bookingService.findEntity(bookingId);
        boolean isOwner = booking.getCustomer().getId().equals(principal.getId());
        if (!isOwner && principal.getUser().getRole() == Role.CUSTOMER) {
            throw new AccessDeniedException("You do not have permission to view this payment.");
        }
        return paymentRepository.findByBookingId(bookingId)
                .map(PaymentResponse::from)
                .orElseThrow(() -> new NotFoundException("No payment found for this booking"));
    }
}
