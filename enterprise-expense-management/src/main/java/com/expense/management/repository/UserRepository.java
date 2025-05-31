package com.expense.management.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.expense.management.entity.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
