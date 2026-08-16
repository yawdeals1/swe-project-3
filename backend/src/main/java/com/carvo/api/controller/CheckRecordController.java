package com.carvo.api.controller;

import com.carvo.api.dto.checkrecord.CheckRecordResponse;
import com.carvo.api.dto.checkrecord.CreateCheckRecordRequest;
import com.carvo.api.security.CarvoUserPrincipal;
import com.carvo.api.service.CheckRecordService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/bookings/{bookingId}/check-records")
public class CheckRecordController {

    private final CheckRecordService checkRecordService;

    public CheckRecordController(CheckRecordService checkRecordService) {
        this.checkRecordService = checkRecordService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<CheckRecordResponse> create(
            @AuthenticationPrincipal CarvoUserPrincipal principal,
            @PathVariable Long bookingId,
            @Valid @RequestBody CreateCheckRecordRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(checkRecordService.create(bookingId, principal.getId(), request));
    }

    @GetMapping
    public List<CheckRecordResponse> forBooking(
            @AuthenticationPrincipal CarvoUserPrincipal principal,
            @PathVariable Long bookingId) {
        return checkRecordService.findByBooking(principal, bookingId);
    }
}
