package com.expense.management.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "audit_logs")
@Data
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String action;
    private String entityName;
    private String entityId;
    private String performedBy;
    private LocalDateTime timestamp;

    @JoinColumn
    User user;
    
    @Column(length = 2000)
    private String details;

    // Constructors
    public AuditLog() {
    }

    public AuditLog(String action, String entityName, String entityId, String performedBy, LocalDateTime timestamp,
            
            String details) {
        this.action = action;
        this.entityName = entityName;
        this.entityId = entityId;
        this.performedBy = performedBy;
        this.timestamp = timestamp;
        this.details = details;
    }

    // Getters and Setters

    
}
