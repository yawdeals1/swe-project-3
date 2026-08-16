package com.carvo.api.service;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;

import org.springframework.stereotype.Service;

import com.carvo.api.dto.admin.BranchRequest;
import com.carvo.api.dto.admin.BranchResponse;
import com.carvo.api.dto.admin.CreateStaffRequest;
import com.carvo.api.dto.admin.DashboardResponse;
import com.carvo.api.dto.admin.UpdateStaffRequest;
import com.carvo.api.dto.common.UserSummary;
import com.carvo.api.entity.Branch;
import com.carvo.api.entity.User;
import com.carvo.api.entity.enums.BookingStatus;
import com.carvo.api.entity.enums.Role;
import com.carvo.api.entity.enums.UserStatus;
import com.carvo.api.entity.enums.VehicleStatus;
import com.carvo.api.exception.ConflictException;
import com.carvo.api.exception.NotFoundException;
import com.carvo.api.repository.BookingRepository;
import com.carvo.api.repository.BranchRepository;
import com.carvo.api.repository.PaymentRepository;
import com.carvo.api.repository.UserRepository;
import com.carvo.api.repository.VehicleRepository;
import com.carvo.api.security.DeploroAuthClient;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final VehicleRepository vehicleRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final DeploroAuthClient deploroAuthClient;
    private final SecureRandom secureRandom = new SecureRandom();

    public AdminService(
            UserRepository userRepository,
            BranchRepository branchRepository,
            VehicleRepository vehicleRepository,
            BookingRepository bookingRepository,
            PaymentRepository paymentRepository,
            DeploroAuthClient deploroAuthClient) {
        this.userRepository = userRepository;
        this.branchRepository = branchRepository;
        this.vehicleRepository = vehicleRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.deploroAuthClient = deploroAuthClient;
    }

    public UserSummary createStaff(CreateStaffRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("An account with this email already exists.");
        }
        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setRole(Role.valueOf(request.role()));
        user.setStatus(UserStatus.ACTIVE);
        if (request.branchId() != null) {
            user.setBranch(findBranch(request.branchId()));
        }
        UserSummary summary = UserSummary.from(userRepository.save(user));
        // The admin creating this account never chooses or sees its password — Deploro requires
        // one to exist for the email/password identity, so a random value is generated and
        // discarded immediately. The confirmation email Deploro sends must be clicked once before
        // first login (FR-1.7 bootstrap; same gate AdminSeeder's seed Admin goes through), after
        // which the new staff member sets their own password via "forgot password" on the login page.
        deploroAuthClient.signup(request.email(), generateRandomPassword(), request.name());
        return summary;
    }

    private String generateRandomPassword() {
        byte[] bytes = new byte[24];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public List<UserSummary> listStaff() {
        List<User> staff = userRepository.findByRole(Role.STAFF);
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        return java.util.stream.Stream.concat(staff.stream(), admins.stream())
                .map(UserSummary::from)
                .toList();
    }

    public List<UserSummary> listCustomers() {
        return userRepository.findByRole(Role.CUSTOMER).stream()
                .map(UserSummary::from)
                .toList();
    }

    public UserSummary suspendCustomer(Long id) {
        User user = findCustomer(id);
        if (user.getStatus() == UserStatus.DELETED) {
            throw new ConflictException("This customer account has already been deleted.");
        }
        user.setStatus(UserStatus.SUSPENDED);
        return UserSummary.from(userRepository.save(user));
    }

    public UserSummary deleteCustomer(Long id) {
        User user = findCustomer(id);
        user.setStatus(UserStatus.DELETED);
        return UserSummary.from(userRepository.save(user));
    }

    public UserSummary updateStaff(Long id, UpdateStaffRequest request) {
        User user = findStaffOrAdmin(id);
        user.setName(request.name());
        user.setPhone(request.phone());
        user.setBranch(request.branchId() != null ? findBranch(request.branchId()) : null);
        return UserSummary.from(userRepository.save(user));
    }

    public void deleteStaff(Long id) {
        User user = findStaffOrAdmin(id);
        userRepository.delete(user);
        // Best-effort: also remove the matching Deploro Auth-as-a-Service account, so this email
        // isn't stuck "already confirmed" (and unable to receive a fresh invite) if re-added later.
        deploroAuthClient.deleteAccountByEmail(user.getEmail());
    }

    public DashboardResponse dashboard() {
        long totalVehicles = vehicleRepository.count();
        long availableVehicles = vehicleRepository.findAll().stream()
                .filter(v -> v.getStatus() == VehicleStatus.AVAILABLE)
                .count();
        long activeBookings = bookingRepository.countByStatusIn(
                List.of(BookingStatus.CONFIRMED, BookingStatus.ONGOING));
        long pendingBookings = bookingRepository.countByStatusIn(List.of(BookingStatus.PENDING));
        double utilizationRate = totalVehicles == 0
                ? 0.0
                : (double) (totalVehicles - availableVehicles) / totalVehicles;
        return new DashboardResponse(
                totalVehicles,
                availableVehicles,
                activeBookings,
                pendingBookings,
                utilizationRate,
                paymentRepository.sumCompletedRevenue());
    }

    public BranchResponse createBranch(BranchRequest request) {
        Branch branch = new Branch();
        branch.setName(request.name());
        branch.setAddress(request.address());
        branch.setPhone(request.phone());
        return BranchResponse.from(branchRepository.save(branch));
    }

    public List<BranchResponse> listBranches() {
        return branchRepository.findAll().stream().map(BranchResponse::from).toList();
    }

    private Branch findBranch(Long id) {
        return branchRepository.findById(id).orElseThrow(() -> new NotFoundException("Branch not found"));
    }

    private User findStaffOrAdmin(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new NotFoundException("User not found"));
        if (user.getRole() == Role.CUSTOMER) {
            throw new NotFoundException("User not found");
        }
        return user;
    }

    private User findCustomer(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new NotFoundException("User not found"));
        if (user.getRole() != Role.CUSTOMER) {
            throw new NotFoundException("Customer not found");
        }
        return user;
    }
}
