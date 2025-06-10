package com.expense.management.controller;

import com.expense.management.model.Budget;
import com.expense.management.model.Expense;
import com.expense.management.model.ExpenseStatus;
import com.expense.management.dao.ExpenseDAO;
import com.expense.management.dao.BudgetDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.expense.management.services.AuditService;
import com.expense.management.services.NotificationService;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    @Autowired
    private ExpenseDAO expenseDAO;

    @Autowired
    private BudgetDAO budgetDAO;

    @Autowired
    private AuditService auditService;

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<?> getAllExpenses() {
        try {
            System.out.println("Fetching all expenses..."); // Debug log
            List<Expense> expenses = expenseDAO.getAllExpenses();
            System.out.println("Found " + expenses.size() + " expenses"); // Debug log
            return ResponseEntity.ok(expenses);
        } catch (Exception e) {
            System.err.println("Error fetching expenses: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error fetching expenses: " + e.getMessage());
        }
    }

    @GetMapping("/total")
    public ResponseEntity<Double> getTotalExpenses() {
        try {
            List<Expense> expenses = expenseDAO.getAllExpenses();
            Double total = expenses.stream()
                .mapToDouble(Expense::getAmount)
                .sum();
            return ResponseEntity.ok(total);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(0.0);
        }
    }

    @GetMapping("/by-approval-status")
    public ResponseEntity<?> getExpensesByApprovalStatus() {
        try {
            Map<String, List<Expense>> result = new HashMap<>();
            result.put("approved", expenseDAO.getExpensesByStatus(ExpenseStatus.APPROVED));
            result.put("notApproved", expenseDAO.getExpensesByStatuses(
                List.of(ExpenseStatus.PENDING, ExpenseStatus.REJECTED)
            ));
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error fetching expenses by status: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createExpense(@RequestBody Expense expense) {
        try {
            // Set default auto-approval threshold if not provided
            if (expense.getAutoApprovalThreshold() == null) {
                expense.setAutoApprovalThreshold(5000.0);
            }

            // Set initial status
            if (expense.getAmount() <= expense.getAutoApprovalThreshold()) {
                expense.setApprovalStatus(ExpenseStatus.APPROVED);
            } else {
                expense.setApprovalStatus(ExpenseStatus.PENDING);
            }

            // Save the expense
            Expense savedExpense = expenseDAO.saveExpense(expense);
            
            // Send notification if approved
            if (savedExpense.getApprovalStatus() == ExpenseStatus.APPROVED) {
                notificationService.notifyExpenseStatusChange(savedExpense, ExpenseStatus.PENDING, ExpenseStatus.APPROVED);
            }

            // Log the creation
            auditService.logEvent(
                "system",
                "ADD",
                "Added expense (ID: " + savedExpense.getId() + ")",
                "SUCCESS"
            );

            return ResponseEntity.ok(savedExpense);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error creating expense: " + e.getMessage());
        }
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportExpensesAsCSV() {
        try {
            List<Expense> expenses = expenseDAO.getAllExpenses();
            StringBuilder csvBuilder = new StringBuilder();
            csvBuilder.append("ID,Amount,Category,Description,Date,Approval Status\n");
            
            for (Expense e : expenses) {
                csvBuilder.append(e.getId()).append(",")
                          .append(e.getAmount()).append(",")
                          .append(e.getCategory()).append(",")
                          .append(e.getDescription() != null ? e.getDescription().replace(",", " ") : "").append(",")
                          .append(e.getDate()).append(",")
                          .append(e.getApprovalStatus()).append("\n");
            }
            
            byte[] csvBytes = csvBuilder.toString().getBytes(StandardCharsets.UTF_8);
            HttpHeaders headers = new HttpHeaders();
            headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=expenses_report.csv");
            headers.setContentType(MediaType.parseMediaType("text/csv"));
            
            return ResponseEntity.ok().headers(headers).body(csvBytes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new byte[0]);
        }
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveExpense(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        try {
            Expense expense = expenseDAO.getExpenseById(id);
            if (expense == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Expense not found with id: " + id);
            }

            ExpenseStatus oldStatus = expense.getApprovalStatus();
            expense.setApprovalStatus(ExpenseStatus.APPROVED);
            
            // Set default notification preferences if null
            if (expense.getNotifyOnApproval() == null) {
                expense.setNotifyOnApproval(true);
            }
            if (expense.getNotifyOnRejection() == null) {
                expense.setNotifyOnRejection(true);
            }
            
            Expense updatedExpense = expenseDAO.saveExpense(expense);

            // Send notification if enabled (safely handle null)
            Boolean shouldNotify = updatedExpense.getNotifyOnApproval();
            if (Boolean.TRUE.equals(shouldNotify)) {
                notificationService.notifyExpenseStatusChange(updatedExpense, oldStatus, ExpenseStatus.APPROVED);
            }

            // Log the approval
            auditService.logEvent(
                "system",
                "APPROVE",
                "Approved expense (ID: " + id + ")" + (body != null && body.containsKey("comment") ? " - Comment: " + body.get("comment") : ""),
                "SUCCESS"
            );

            return ResponseEntity.ok(updatedExpense);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error approving expense: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectExpense(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        try {
            Expense expense = expenseDAO.getExpenseById(id);
            if (expense == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Expense not found with id: " + id);
            }

            ExpenseStatus oldStatus = expense.getApprovalStatus();
            expense.setApprovalStatus(ExpenseStatus.REJECTED);
            Expense updatedExpense = expenseDAO.saveExpense(expense);

            // Send notification if enabled
            if (updatedExpense.getNotifyOnRejection()) {
                notificationService.notifyExpenseStatusChange(updatedExpense, oldStatus, ExpenseStatus.REJECTED);
            }

            // Log the rejection
            auditService.logEvent(
                "system",
                "REJECT",
                "Rejected expense (ID: " + id + ")" + (body != null && body.containsKey("comment") ? " - Comment: " + body.get("comment") : ""),
                "SUCCESS"
            );

            return ResponseEntity.ok(updatedExpense);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error rejecting expense: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/comment")
    public ResponseEntity<?> addComment(@PathVariable Long id, @RequestBody Map<String, String> commentRequest) {
        try {
            System.out.println("Received comment request for expense ID: " + id);
            System.out.println("Comment request body: " + commentRequest);

            Expense expense = expenseDAO.getExpenseById(id);
            if (expense == null) {
                System.out.println("Expense not found with ID: " + id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Expense not found with id: " + id);
            }

            String comment = commentRequest.get("comment");
            if (comment == null || comment.trim().isEmpty()) {
                System.out.println("Empty comment received");
                return ResponseEntity.badRequest()
                    .body("Comment cannot be empty");
            }

            System.out.println("Adding comment to expense: " + comment);

            // Log the comment
            auditService.logEvent(
                "system",
                "COMMENT",
                "Added comment to expense (ID: " + id + "): " + comment,
                "SUCCESS"
            );

            // You might want to store the comment in a separate table
            // For now, we'll just log it in the audit log
            return ResponseEntity.ok(Map.of(
                "message", "Comment added successfully",
                "expenseId", id,
                "comment", comment
            ));
        } catch (Exception e) {
            System.err.println("Error adding comment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error adding comment: " + e.getMessage());
        }
    }
}



