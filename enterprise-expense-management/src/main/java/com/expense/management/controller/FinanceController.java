package com.expense.management.controller;

import com.expense.management.model.Expense;
import com.expense.management.model.ApprovalStage;
import com.expense.management.model.ExpenseStatus;
import com.expense.management.dao.ExpenseDAO;
import com.expense.management.services.ApprovalWorkflowService;
import com.expense.management.services.AuditService;
import com.expense.management.services.NotificationService;
import com.expense.management.model.User;
import com.expense.management.model.Role;
import com.expense.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/finance")
public class FinanceController {

    @Autowired
    private ExpenseDAO expenseDAO;

    @Autowired
    private AuditService auditService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private ApprovalWorkflowService approvalWorkflowService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Get all expenses pending finance approval
     */
    @GetMapping("/pending-expenses")
    public ResponseEntity<?> getPendingExpenses() {
        try {
            List<Expense> allExpenses = expenseDAO.getAllExpenses();
            List<Expense> pendingFinanceExpenses = allExpenses.stream()
                .filter(expense -> expense.getCurrentApprovalStage() == ApprovalStage.PENDING_FINANCE)
                .collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(pendingFinanceExpenses);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error fetching pending finance expenses: " + e.getMessage());
        }
    }

    /**
     * Get finance dashboard statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getFinanceStats() {
        try {
            List<Expense> allExpenses = expenseDAO.getAllExpenses();
            
            Map<String, Object> stats = new HashMap<>();
            
            // Count expenses by stage
            long pendingFinance = allExpenses.stream()
                .filter(e -> e.getCurrentApprovalStage() == ApprovalStage.PENDING_FINANCE)
                .count();
            
            long approvedByFinance = allExpenses.stream()
                .filter(e -> e.getApprovalStatus() == ExpenseStatus.APPROVED && 
                           e.getCurrentApprovalStage() == ApprovalStage.APPROVED)
                .count();
            
            // Calculate total amounts
            double totalPendingAmount = allExpenses.stream()
                .filter(e -> e.getCurrentApprovalStage() == ApprovalStage.PENDING_FINANCE)
                .mapToDouble(Expense::getAmount)
                .sum();
            
            double totalApprovedAmount = allExpenses.stream()
                .filter(e -> e.getApprovalStatus() == ExpenseStatus.APPROVED)
                .mapToDouble(Expense::getAmount)
                .sum();
            
            stats.put("pendingExpenses", pendingFinance);
            stats.put("approvedExpenses", approvedByFinance);
            stats.put("totalPendingAmount", totalPendingAmount);
            stats.put("totalApprovedAmount", totalApprovedAmount);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error fetching finance stats: " + e.getMessage());
        }
    }

    /**
     * Approve expense (Finance level)
     */
    @PutMapping("/expenses/{id}/approve")
    public ResponseEntity<?> approveExpense(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        try {
            Expense expense = expenseDAO.getExpenseById(id);
            if (expense == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Expense not found with id: " + id);
            }

            // Verify expense is in PENDING_FINANCE stage
            if (expense.getCurrentApprovalStage() != ApprovalStage.PENDING_FINANCE) {
                return ResponseEntity.badRequest()
                    .body("Expense is not in PENDING_FINANCE stage");
            }

            // Get approver ID from request body or find a finance user
            Long approverId = null;
            if (body != null && body.containsKey("approverId")) {
                try {
                    approverId = Long.parseLong(body.get("approverId"));
                } catch (NumberFormatException e) {
                    return ResponseEntity.badRequest().body("Invalid approver ID format");
                }
            }
            
            // If no approver ID provided, find a finance user
            if (approverId == null) {
                List<User> users = userRepository.findAll();
                Optional<User> approver = users.stream()
                    .filter(user -> user.getRole() == Role.FINANCE || user.getRole() == Role.ADMIN)
                    .findFirst();
                
                if (approver.isPresent()) {
                    approverId = approver.get().getId();
                } else {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("No valid finance approver found in system");
                }
            }
            
            String comment = body != null && body.containsKey("comment") ? body.get("comment") : "";

            // Process approval using workflow service
            boolean success = approvalWorkflowService.processApproval(id, approverId, comment, true);

            if (success) {
                Expense updatedExpense = expenseDAO.getExpenseById(id);
                return ResponseEntity.ok(updatedExpense);
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to process finance approval");
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error approving expense: " + e.getMessage());
        }
    }

    /**
     * Reject expense (Finance level)
     */
    @PutMapping("/expenses/{id}/reject")
    public ResponseEntity<?> rejectExpense(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        try {
            Expense expense = expenseDAO.getExpenseById(id);
            if (expense == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Expense not found with id: " + id);
            }

            // Verify expense is in PENDING_FINANCE stage
            if (expense.getCurrentApprovalStage() != ApprovalStage.PENDING_FINANCE) {
                return ResponseEntity.badRequest()
                    .body("Expense is not in PENDING_FINANCE stage");
            }

            // Get approver ID from request body or find a finance user
            Long approverId = null;
            if (body != null && body.containsKey("approverId")) {
                try {
                    approverId = Long.parseLong(body.get("approverId"));
                } catch (NumberFormatException e) {
                    return ResponseEntity.badRequest().body("Invalid approver ID format");
                }
            }
            
            // If no approver ID provided, find a finance user
            if (approverId == null) {
                List<User> users = userRepository.findAll();
                Optional<User> approver = users.stream()
                    .filter(user -> user.getRole() == Role.FINANCE || user.getRole() == Role.ADMIN)
                    .findFirst();
                
                if (approver.isPresent()) {
                    approverId = approver.get().getId();
                } else {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("No valid finance approver found in system");
                }
            }
            
            String comment = body != null && body.containsKey("comment") ? body.get("comment") : "";

            // Process rejection using workflow service
            boolean success = approvalWorkflowService.processApproval(id, approverId, comment, false);

            if (success) {
                Expense updatedExpense = expenseDAO.getExpenseById(id);
                return ResponseEntity.ok(updatedExpense);
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to process finance rejection");
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error rejecting expense: " + e.getMessage());
        }
    }

    /**
     * Get expenses by amount range for finance approval
     */
    @GetMapping("/expenses/range/{minAmount}/{maxAmount}")
    public ResponseEntity<?> getExpensesByAmountRange(@PathVariable Double minAmount, @PathVariable Double maxAmount) {
        try {
            List<Expense> allExpenses = expenseDAO.getAllExpenses();
            List<Expense> filteredExpenses = allExpenses.stream()
                .filter(expense -> expense.getAmount() >= minAmount && expense.getAmount() <= maxAmount)
                .collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(filteredExpenses);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error fetching expenses by amount range: " + e.getMessage());
        }
    }
} 