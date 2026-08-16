package com.carvo.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.carvo.api.dto.common.UserSummary;
import com.carvo.api.entity.User;
import com.carvo.api.entity.enums.Role;
import com.carvo.api.entity.enums.UserStatus;
import com.carvo.api.repository.BookingRepository;
import com.carvo.api.repository.BranchRepository;
import com.carvo.api.repository.PaymentRepository;
import com.carvo.api.repository.UserRepository;
import com.carvo.api.repository.VehicleRepository;
import com.carvo.api.security.DeploroAuthClient;
import java.lang.reflect.Field;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private BranchRepository branchRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private DeploroAuthClient deploroAuthClient;

    private AdminService adminService;

    @BeforeEach
    void setUp() {
        adminService = new AdminService(
                userRepository,
                branchRepository,
                vehicleRepository,
                bookingRepository,
                paymentRepository,
                deploroAuthClient);
    }

    @Test
    void suspendCustomer_setsAccountStatusToSuspended() {
        User customer = new User();
        setId(customer, 7L);
        customer.setName("Ada");
        customer.setRole(Role.CUSTOMER);
        customer.setStatus(UserStatus.ACTIVE);

        when(userRepository.findById(7L)).thenReturn(Optional.of(customer));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserSummary summary = adminService.suspendCustomer(7L);

        assertThat(summary.status()).isEqualTo("SUSPENDED");
        assertThat(customer.getStatus()).isEqualTo(UserStatus.SUSPENDED);
    }

    @Test
    void deleteCustomer_marksAccountDeletedWithoutRemovingRecord() {
        User customer = new User();
        setId(customer, 11L);
        customer.setName("Grace");
        customer.setRole(Role.CUSTOMER);
        customer.setStatus(UserStatus.ACTIVE);

        when(userRepository.findById(11L)).thenReturn(Optional.of(customer));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserSummary summary = adminService.deleteCustomer(11L);

        assertThat(summary.status()).isEqualTo("DELETED");
        assertThat(customer.getStatus()).isEqualTo(UserStatus.DELETED);
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
