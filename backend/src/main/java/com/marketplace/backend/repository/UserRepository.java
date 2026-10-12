package com.marketplace.backend.repository;

import com.marketplace.backend.entity.User;
import com.marketplace.backend.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    List<User> findAllByEmail(String email);

    Optional<User> findByEmailAndRole(String email, UserRole role);

    boolean existsByEmail(String email);

    boolean existsByEmailAndRole(String email, UserRole role);

    boolean existsByPhone(String phone);

    boolean existsByPhoneAndRole(String phone, UserRole role);

    List<User> findAllByPhone(String phone);
}
