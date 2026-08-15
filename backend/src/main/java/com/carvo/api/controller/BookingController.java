package com.carvo.api.controller;

import com.carvo.api.dto.booking.BookingResponse;
import com.carvo.api.dto.booking.CreateBookingRequest;
import com.carvo.api.entity.Booking;
import com.carvo.api.security.CarvoUserPrincipal;
import com.carvo.api.service.BookingService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<BookingResponse> create(
            @AuthenticationPrincipal CarvoUserPrincipal principal,
            @Valid @RequestBody CreateBookingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.create(principal.getId(), request));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public List<BookingResponse> myBookings(@AuthenticationPrincipal CarvoUserPrincipal principal) {
        return bookingService.findByCustomer(principal.getId());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public List<BookingResponse> all(@RequestParam(required = false) String status) {
        return bookingService.findAll(status);
    }

    @GetMapping("/{id}")
    public BookingResponse getById(@AuthenticationPrincipal CarvoUserPrincipal principal, @PathVariable Long id) {
        Booking booking = bookingService.findEntity(id);
        boolean isOwner = booking.getCustomer().getId().equals(principal.getId());
        boolean isStaffOrAdmin = principal.getUser().getRole() != com.carvo.api.entity.enums.Role.CUSTOMER;
        if (!isOwner && !isStaffOrAdmin) {
            throw new AccessDeniedException("You do not have permission to view this booking.");
        }
        return BookingResponse.from(booking);
    }

    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public BookingResponse confirm(@AuthenticationPrincipal CarvoUserPrincipal principal, @PathVariable Long id) {
        return bookingService.confirm(id, principal.getId());
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public BookingResponse reject(@AuthenticationPrincipal CarvoUserPrincipal principal, @PathVariable Long id) {
        return bookingService.reject(id, principal.getId());
    }
}
