package com.expense.management.services;

import org.springframework.stereotype.Service;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import com.expense.management.model.Expense;
import com.expense.management.model.ExpenseStatus;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
public class NotificationService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Cache to prevent duplicate notifications within a short time window
    private final ConcurrentHashMap<String, Long> recentNotifications = new ConcurrentHashMap<>();
    private static final long DEDUPLICATION_WINDOW_MS = 5000; // 5 seconds

    public void notifyExpenseStatusChange(Expense expense, ExpenseStatus oldStatus, ExpenseStatus newStatus) {
        if (expense == null) {
            return; // Don't send notification if expense is null
        }

        String message;
        String destination;
        Long expenseId = expense.getId();

        if (expenseId == null) {
            // If expense hasn't been saved yet, use a temporary ID
            expenseId = System.currentTimeMillis();
        }

        // Create the message first
        if (newStatus == ExpenseStatus.APPROVED) {
            if (expense.getAmount() <= expense.getAutoApprovalThreshold()) {
                message = String.format("Expense #%d for ₹%.2f has been auto-approved", 
                    expenseId, expense.getAmount());
            } else {
                message = String.format("Expense #%d for ₹%.2f has been approved", 
                    expenseId, expense.getAmount());
            }
        } else if (newStatus == ExpenseStatus.REJECTED) {
            message = String.format("Expense #%d for ₹%.2f has been rejected", 
                expenseId, expense.getAmount());
        } else {
            message = String.format("Expense #%d for ₹%.2f status changed from %s to %s", 
                expenseId, expense.getAmount(), oldStatus, newStatus);
        }

        // Check for duplicate notification
        String notificationKey = expenseId + ":" + newStatus;
        long currentTime = System.currentTimeMillis();
        Long lastNotificationTime = recentNotifications.get(notificationKey);
        
        if (lastNotificationTime != null && 
            (currentTime - lastNotificationTime) < DEDUPLICATION_WINDOW_MS) {
            // Skip duplicate notification within the time window
            return;
        }

        // Update the last notification time
        recentNotifications.put(notificationKey, currentTime);

        // Clean up old entries
        recentNotifications.entrySet().removeIf(entry -> 
            (currentTime - entry.getValue()) > DEDUPLICATION_WINDOW_MS);

        // Determine the destination based on the expense status and user
        if (expense.getEmployeeId() != null) {
            // Send to user-specific topic only
            destination = "/user/" + expense.getEmployeeId() + "/notifications";
        } else {
            // Fallback to general topic based on status
            if (newStatus == ExpenseStatus.APPROVED) {
                destination = expense.getAmount() <= expense.getAutoApprovalThreshold() 
                    ? "/topic/auto-approved" 
                    : "/topic/approved";
            } else if (newStatus == ExpenseStatus.REJECTED) {
                destination = "/topic/rejected";
            } else {
                destination = "/topic/status-updates";
            }
        }

        // Send notification to the determined destination only
        messagingTemplate.convertAndSend(destination, message);
    }
} 