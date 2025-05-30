package com.expense.management.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.expense.management.model.AuditLog;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByEntityName(String entityName);
}

