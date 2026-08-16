package com.carvo.api.controller;

import com.carvo.api.dto.booking.BookingResponse;
import com.carvo.api.dto.common.UserSummary;
import com.carvo.api.service.StaffService;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/staff/customers")
@PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
public class StaffController {

    private final StaffService staffService;

    public StaffController(StaffService staffService) {
        this.staffService = staffService;
    }

    @GetMapping
    public List<UserSummary> search(@RequestParam(required = false) String q) {
        return staffService.searchCustomers(q);
    }

    @GetMapping("/{id}")
    public UserSummary getById(@PathVariable Long id) {
        return staffService.getCustomer(id);
    }

    @GetMapping("/{id}/bookings")
    public List<BookingResponse> bookingHistory(@PathVariable Long id) {
        return staffService.getCustomerHistory(id);
    }
}
