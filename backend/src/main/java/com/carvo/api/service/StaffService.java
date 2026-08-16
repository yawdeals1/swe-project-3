package com.carvo.api.service;

import com.carvo.api.dto.booking.BookingResponse;
import com.carvo.api.dto.common.UserSummary;
import com.carvo.api.entity.User;
import com.carvo.api.entity.enums.Role;
import com.carvo.api.exception.NotFoundException;
import com.carvo.api.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class StaffService {

    private final UserRepository userRepository;
    private final BookingService bookingService;

    public StaffService(UserRepository userRepository, BookingService bookingService) {
        this.userRepository = userRepository;
        this.bookingService = bookingService;
    }

    public List<UserSummary> searchCustomers(String query) {
        List<User> customers = (query == null || query.isBlank())
                ? userRepository.findByRole(Role.CUSTOMER)
                : userRepository.searchByRoleAndQuery(Role.CUSTOMER, query.trim());
        return customers.stream().map(UserSummary::from).toList();
    }

    public UserSummary getCustomer(Long id) {
        return UserSummary.from(findCustomer(id));
    }

    public List<BookingResponse> getCustomerHistory(Long id) {
        findCustomer(id);
        return bookingService.findByCustomer(id);
    }

    private User findCustomer(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new NotFoundException("Customer not found"));
        if (user.getRole() != Role.CUSTOMER) {
            throw new NotFoundException("Customer not found");
        }
        return user;
    }
}
