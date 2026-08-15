package com.carvo.api.repository;

import com.carvo.api.entity.User;
import com.carvo.api.entity.enums.Role;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    java.util.List<User> findByRole(Role role);
}
