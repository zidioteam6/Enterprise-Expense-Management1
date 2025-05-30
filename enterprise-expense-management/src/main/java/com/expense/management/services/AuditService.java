package com.expense.management.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.expense.management.model.AuditLog;
import com.expense.management.repository.AuditLogRepository;

@Service
public class AuditService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public void log(String action, String entityName, String entityId, String performedBy, String details) {
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setEntityName(entityName);
        log.setEntityId(entityId);
        log.setPerformedBy(performedBy);
        log.setTimestamp(LocalDateTime.now());
        log.setDetails(details);
        auditLogRepository.save(log);
    }

    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findAll();
    }
}

