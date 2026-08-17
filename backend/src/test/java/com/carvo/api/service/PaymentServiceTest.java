package com.carvo.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.carvo.api.dto.payment.CreatePaymentRequest;
import com.carvo.api.dto.payment.PaymentResponse;
import com.carvo.api.entity.Booking;
import com.carvo.api.entity.Payment;
import com.carvo.api.entity.User;
import com.carvo.api.entity.enums.BookingStatus;
import com.carvo.api.entity.enums.PaymentStatus;
import com.carvo.api.exception.ConflictException;
import com.carvo.api.exception.NotFoundException;
import com.carvo.api.repository.PaymentRepository;
import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private BookingService bookingService;

    private PaymentService paymentService;

    @BeforeEach
    void setUp() {
        paymentService = new PaymentService(paymentRepository, bookingService);
    }

    @Test
    void pay_confirmedBooking_createsPendingPaymentNotAlreadyCompleted() {
        User customer = new User();
        setId(customer, 5L);

        Booking booking = new Booking();
        setId(booking, 10L);
        booking.setCustomer(customer);
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setTotalAmount(new BigDecimal("150.00"));

        when(bookingService.findEntity(10L)).thenReturn(booking);
        when(paymentRepository.findByBookingId(10L)).thenReturn(Optional.empty());
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        PaymentResponse response = paymentService.pay(5L, new CreatePaymentRequest(10L, "CARD"));

        assertThat(response.status()).isEqualTo("PENDING");
        assertThat(response.paidAt()).isNull();
    }

    @Test
    void verify_pendingPayment_marksCompletedAndStampsPaidAt() {
        Payment payment = new Payment();
        setId(payment, 1L);
        Booking booking = new Booking();
        payment.setBooking(booking);
        payment.setStatus(PaymentStatus.PENDING);

        when(paymentRepository.findById(1L)).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        PaymentResponse response = paymentService.verify(1L);

        assertThat(response.status()).isEqualTo("COMPLETED");
        assertThat(payment.getPaidAt()).isNotNull();
    }

    @Test
    void verify_alreadyCompletedPayment_throwsConflict() {
        Payment payment = new Payment();
        setId(payment, 1L);
        payment.setStatus(PaymentStatus.COMPLETED);

        when(paymentRepository.findById(1L)).thenReturn(Optional.of(payment));

        assertThatThrownBy(() -> paymentService.verify(1L)).isInstanceOf(ConflictException.class);
    }

    @Test
    void verify_missingPayment_throwsNotFound() {
        when(paymentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> paymentService.verify(99L)).isInstanceOf(NotFoundException.class);
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
