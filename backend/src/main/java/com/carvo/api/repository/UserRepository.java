package com.carvo.api.repository;

import com.carvo.api.entity.User;
import com.carvo.api.entity.enums.Role;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByDeploroAccountId(String deploroAccountId);

    List<User> findByRole(Role role);

    @Query("SELECT u FROM User u WHERE u.role = :role AND "
            + "(LOWER(u.name) LIKE LOWER(CONCAT('%', :query, '%')) "
            + "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<User> searchByRoleAndQuery(@Param("role") Role role, @Param("query") String query);
}
