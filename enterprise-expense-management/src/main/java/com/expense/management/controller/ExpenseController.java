package com.expense.management.controller;

import com.expense.management.model.Budget;
import com.expense.management.model.Expense;
import com.expense.management.model.ExpenseStatus;
import com.expense.management.model.ApprovalHistory;
import com.expense.management.model.ApprovalStage;
import com.expense.management.dao.ExpenseDAO;
import com.expense.management.dao.BudgetDAO;
import com.expense.management.services.ApprovalWorkflowService;
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
import java.util.Optional;

import com.expense.management.services.AuditService;
import com.expense.management.services.NotificationService;
import com.expense.management.model.User;
import com.expense.management.model.Role;
import com.expense.management.repository.UserRepository;

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

    @Autowired
    private ApprovalWorkflowService approvalWorkflowService;

    @Autowired
    private UserRepository userRepository;

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

            // Determine initial approval stage using workflow service
            ApprovalStage initialStage = approvalWorkflowService.determineInitialStage(expense);
            expense.setCurrentApprovalStage(initialStage);

            // Set initial status based on stage
            if (initialStage == ApprovalStage.AUTO_APPROVED) {
                expense.setApprovalStatus(ExpenseStatus.APPROVED);
            } else {
                expense.setApprovalStatus(ExpenseStatus.PENDING);
            }

            // Save the expense
            Expense savedExpense = expenseDAO.saveExpense(expense);
            
            // Process auto-approval if applicable
            if (initialStage == ApprovalStage.AUTO_APPROVED) {
                approvalWorkflowService.processAutoApproval(savedExpense);
            }
            
            // Send notification if approved
            if (savedExpense.getApprovalStatus() == ExpenseStatus.APPROVED) {
                notificationService.notifyExpenseStatusChange(savedExpense, ExpenseStatus.PENDING, ExpenseStatus.APPROVED);
            }

            // Log the creation
            auditService.logEvent(
                "system",
                "ADD",
                "Added expense (ID: " + savedExpense.getId() + ") with stage: " + initialStage,
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

            // Get approver ID from request body or try to find a valid user
            Long approverId = null;
            if (body != null && body.containsKey("approverId")) {
                try {
                    approverId = Long.parseLong(body.get("approverId"));
                } catch (NumberFormatException e) {
                    return ResponseEntity.badRequest().body("Invalid approver ID format");
                }
            }
            
            // If no approver ID provided, try to find a manager/admin user
            if (approverId == null) {
                // For now, we'll use a fallback approach - find any user with MANAGER or ADMIN role
                // In a real application, this would come from JWT token
                List<User> users = userRepository.findAll();
                Optional<User> approver = users.stream()
                    .filter(user -> user.getRole() == Role.MANAGER || user.getRole() == Role.ADMIN)
                    .findFirst();
                
                if (approver.isPresent()) {
                    approverId = approver.get().getId();
                } else {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("No valid approver found in system");
                }
            }
            
            String comment = body != null && body.containsKey("comment") ? body.get("comment") : "";

            // Process approval using workflow service
            boolean success = approvalWorkflowService.processApproval(id, approverId, comment, true);

            if (success) {
                // Get updated expense
                Expense updatedExpense = expenseDAO.getExpenseById(id);
                return ResponseEntity.ok(updatedExpense);
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to process approval");
            }

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

            // Get approver ID from request body or try to find a valid user
            Long approverId = null;
            if (body != null && body.containsKey("approverId")) {
                try {
                    approverId = Long.parseLong(body.get("approverId"));
                } catch (NumberFormatException e) {
                    return ResponseEntity.badRequest().body("Invalid approver ID format");
                }
            }
            
            // If no approver ID provided, try to find a manager/admin user
            if (approverId == null) {
                // For now, we'll use a fallback approach - find any user with MANAGER or ADMIN role
                // In a real application, this would come from JWT token
                List<User> users = userRepository.findAll();
                Optional<User> approver = users.stream()
                    .filter(user -> user.getRole() == Role.MANAGER || user.getRole() == Role.ADMIN)
                    .findFirst();
                
                if (approver.isPresent()) {
                    approverId = approver.get().getId();
                } else {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("No valid approver found in system");
                }
            }
            
            String comment = body != null && body.containsKey("comment") ? body.get("comment") : "";

            // Process rejection using workflow service
            boolean success = approvalWorkflowService.processApproval(id, approverId, comment, false);

            if (success) {
                // Get updated expense
                Expense updatedExpense = expenseDAO.getExpenseById(id);
                return ResponseEntity.ok(updatedExpense);
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to process rejection");
            }

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

    @GetMapping("/{id}/approval-history")
    public ResponseEntity<?> getApprovalHistory(@PathVariable Long id) {
        try {
            List<ApprovalHistory> history = approvalWorkflowService.getApprovalHistory(id);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error fetching approval history: " + e.getMessage());
        }
    }

    @GetMapping("/pending/{stage}")
    public ResponseEntity<?> getExpensesByStage(@PathVariable String stage) {
        try {
            ApprovalStage approvalStage = ApprovalStage.valueOf(stage.toUpperCase());
            List<Expense> expenses = expenseDAO.getExpensesByStatus(ExpenseStatus.PENDING);
            
            // Filter by current approval stage
            List<Expense> filteredExpenses = expenses.stream()
                .filter(expense -> expense.getCurrentApprovalStage() == approvalStage)
                .collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(filteredExpenses);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid approval stage: " + stage);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error fetching expenses by stage: " + e.getMessage());
        }
    }

    @GetMapping("/pending-for-user/{userId}")
    public ResponseEntity<?> getExpensesPendingForUser(@PathVariable Long userId) {
        try {
            List<Expense> expenses = approvalWorkflowService.getExpensesPendingForUser(userId);
            return ResponseEntity.ok(expenses);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error fetching pending expenses for user: " + e.getMessage());
        }
    }

    @GetMapping("/by-approval-stage")
    public ResponseEntity<?> getExpensesByApprovalStage() {
        try {
            Map<String, List<Expense>> result = new HashMap<>();
            List<Expense> allExpenses = expenseDAO.getAllExpenses();
            
            // Group expenses by approval stage
            result.put("pending_manager", allExpenses.stream()
                .filter(e -> e.getCurrentApprovalStage() == ApprovalStage.PENDING_MANAGER)
                .collect(java.util.stream.Collectors.toList()));
            
            result.put("pending_finance", allExpenses.stream()
                .filter(e -> e.getCurrentApprovalStage() == ApprovalStage.PENDING_FINANCE)
                .collect(java.util.stream.Collectors.toList()));
            
            result.put("pending_admin", allExpenses.stream()
                .filter(e -> e.getCurrentApprovalStage() == ApprovalStage.PENDING_ADMIN)
                .collect(java.util.stream.Collectors.toList()));
            
            result.put("approved", allExpenses.stream()
                .filter(e -> e.getCurrentApprovalStage() == ApprovalStage.APPROVED || 
                           e.getCurrentApprovalStage() == ApprovalStage.AUTO_APPROVED)
                .collect(java.util.stream.Collectors.toList()));
            
            result.put("rejected", allExpenses.stream()
                .filter(e -> e.getCurrentApprovalStage() == ApprovalStage.REJECTED)
                .collect(java.util.stream.Collectors.toList()));
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error fetching expenses by approval stage: " + e.getMessage());
        }
    }
}



