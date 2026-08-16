package com.carvo.api.controller;

import com.carvo.api.dto.admin.BranchRequest;
import com.carvo.api.dto.admin.BranchResponse;
import com.carvo.api.dto.admin.CreateStaffRequest;
import com.carvo.api.dto.admin.DashboardResponse;
import com.carvo.api.dto.admin.UpdateStaffRequest;
import com.carvo.api.dto.booking.BookingResponse;
import com.carvo.api.dto.common.UserSummary;
import com.carvo.api.service.AdminService;
import com.carvo.api.service.BookingService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final AdminService adminService;
    private final BookingService bookingService;

    public AdminController(AdminService adminService, BookingService bookingService) {
        this.adminService = adminService;
        this.bookingService = bookingService;
    }

    @PostMapping("/staff")
    public ResponseEntity<UserSummary> createStaff(@Valid @RequestBody CreateStaffRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createStaff(request));
    }

    @GetMapping("/staff")
    public List<UserSummary> listStaff() {
        return adminService.listStaff();
    }

    @GetMapping("/customers")
    public List<UserSummary> listCustomers() {
        return adminService.listCustomers();
    }

    @PutMapping("/customers/{id}/suspend")
    public UserSummary suspendCustomer(@PathVariable Long id) {
        return adminService.suspendCustomer(id);
    }

    @PutMapping("/customers/{id}/delete")
    public UserSummary deleteCustomer(@PathVariable Long id) {
        return adminService.deleteCustomer(id);
    }

    @PutMapping("/staff/{id}")
    public UserSummary updateStaff(@PathVariable Long id, @Valid @RequestBody UpdateStaffRequest request) {
        return adminService.updateStaff(id, request);
    }

    @DeleteMapping("/staff/{id}")
    public ResponseEntity<Void> deleteStaff(@PathVariable Long id) {
        adminService.deleteStaff(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/bookings")
    public List<BookingResponse> allBookings(@RequestParam(required = false) String status) {
        return bookingService.findAll(status);
    }

    @GetMapping("/dashboard")
    public DashboardResponse dashboard() {
        return adminService.dashboard();
    }

    @PostMapping("/branches")
    public ResponseEntity<BranchResponse> createBranch(@Valid @RequestBody BranchRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createBranch(request));
    }

    @GetMapping("/branches")
    public List<BranchResponse> listBranches() {
        return adminService.listBranches();
    }
}
