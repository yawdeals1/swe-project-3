package com.carvo.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.carvo.api.dto.booking.BookingResponse;
import com.carvo.api.entity.User;
import com.carvo.api.entity.enums.Role;
import com.carvo.api.exception.NotFoundException;
import com.carvo.api.repository.UserRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class StaffServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private BookingService bookingService;

    private StaffService staffService;

    @BeforeEach
    void setUp() {
        staffService = new StaffService(userRepository, bookingService);
    }

    private User customer(Long id) {
        User user = new User();
        user.setName("Ama Owusu");
        user.setEmail("ama@example.com");
        user.setRole(Role.CUSTOMER);
        return user;
    }

    @Test
    void searchCustomers_blankQuery_listsAllCustomers() {
        when(userRepository.findByRole(Role.CUSTOMER)).thenReturn(List.of(customer(1L)));

        List<?> results = staffService.searchCustomers("  ");

        assertThat(results).hasSize(1);
        verify(userRepository, never()).searchByRoleAndQuery(any(), any());
    }

    @Test
    void searchCustomers_withQuery_delegatesToSearch() {
        when(userRepository.searchByRoleAndQuery(Role.CUSTOMER, "ama")).thenReturn(List.of(customer(1L)));

        List<?> results = staffService.searchCustomers("ama");

        assertThat(results).hasSize(1);
        verify(userRepository).searchByRoleAndQuery(eq(Role.CUSTOMER), eq("ama"));
    }

    @Test
    void getCustomerHistory_customerExists_returnsBookings() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(customer(1L)));
        when(bookingService.findByCustomer(1L)).thenReturn(List.<BookingResponse>of());

        List<BookingResponse> history = staffService.getCustomerHistory(1L);

        assertThat(history).isEmpty();
        verify(bookingService).findByCustomer(1L);
    }

    @Test
    void getCustomerHistory_nonCustomerUser_throwsNotFound() {
        User staff = new User();
        staff.setRole(Role.STAFF);
        when(userRepository.findById(2L)).thenReturn(Optional.of(staff));

        assertThatThrownBy(() -> staffService.getCustomerHistory(2L))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void getCustomerHistory_unknownUser_throwsNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> staffService.getCustomerHistory(99L))
                .isInstanceOf(NotFoundException.class);
    }
}
