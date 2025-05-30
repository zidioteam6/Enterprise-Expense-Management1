package com.expense.management.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.expense.management.model.AuditLog;
import com.expense.management.services.AuditService;

@RestController
@RequestMapping("/api/audit")
public class AuditLogController {

    @Autowired
    private AuditService auditService;

    @GetMapping("/logs")
    public List<AuditLog> getAllLogs() {
        return auditService.getAllLogs();
    }
}
