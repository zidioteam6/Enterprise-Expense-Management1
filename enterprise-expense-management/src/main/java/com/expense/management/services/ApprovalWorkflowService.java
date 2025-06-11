package com.expense.management.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.expense.management.model.Expense;
import com.expense.management.model.ApprovalHistory;
import com.expense.management.model.ApprovalStage;
import com.expense.management.model.ExpenseStatus;
import com.expense.management.dao.ExpenseDAO;
import com.expense.management.dao.ApprovalHistoryDAO;
import com.expense.management.repository.UserRepository;import com.expense.management.model.User;
import java.util.List;
import java.util.Optional;

@Service
public class ApprovalWorkflowService {

    @Autowired
    private ExpenseDAO expenseDAO;

    @Autowired
    private ApprovalHistoryDAO approvalHistoryDAO;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuditService auditService;

    /**
     * Determine the initial approval stage based on expense amount
     */
    public ApprovalStage determineInitialStage(Expense expense) {
        double amount = expense.getAmount();
        
        // Auto-approval for expenses up to ₹5000
        if (amount <= expense.getAutoApprovalThreshold()) {
            return ApprovalStage.AUTO_APPROVED;
        }
        
        // Manager approval for expenses ₹6000-₹10000
        if (amount <= expense.getManagerApprovalThreshold()) {
            return ApprovalStage.PENDING_MANAGER;
        }
        
        // Finance approval needed for expenses ₹10000-₹15000
        if (amount <= expense.getFinanceApprovalThreshold()) {
            return ApprovalStage.PENDING_MANAGER; // Manager first, then Finance
        }
        
        // Admin approval needed for expenses ₹15000+
        return ApprovalStage.PENDING_MANAGER; // Manager → Finance → Admin
    }

    /**
     * Process expense approval at current stage
     */
    public boolean processApproval(Long expenseId, Long approverId, String comment, boolean isApproved) {
        try {
            Expense expense = expenseDAO.getExpenseById(expenseId);
            if (expense == null) {
                throw new RuntimeException("Expense not found");
            }

            // Get approver details
            Optional<User> approverOpt = userRepository.findById(approverId);
            if (!approverOpt.isPresent()) {
                throw new RuntimeException("Approver not found");
            }
            User approver = approverOpt.get();

            // Create approval history entry
            ApprovalHistory history = new ApprovalHistory(expenseId, expense.getCurrentApprovalStage(), 
                isApproved ? ApprovalHistory.ApprovalAction.APPROVED : ApprovalHistory.ApprovalAction.REJECTED);
            history.setApproverId(approverId);
            history.setApproverName(approver.getFullName());
            history.setApproverRole(approver.getRole().toString());
            history.setComment(comment);

            if (isApproved) {
                return processApprovalAction(expense, history, approver);
            } else {
                return processRejectionAction(expense, history, approver);
            }

        } catch (Exception e) {
            auditService.logEvent(
                "system",
                "APPROVAL_ERROR",
                "Error processing approval for expense " + expenseId + ": " + e.getMessage(),
                "ERROR"
            );
            throw e;
        }
    }

    /**
     * Process approval action and determine next stage
     */
    private boolean processApprovalAction(Expense expense, ApprovalHistory history, User approver) {
        ApprovalStage currentStage = expense.getCurrentApprovalStage();
        ApprovalStage nextStage = getNextApprovalStage(currentStage, expense);

        // Save approval history
        approvalHistoryDAO.saveApprovalHistory(history);

        // Update expense status
        if (nextStage == ApprovalStage.APPROVED) {
            expense.setApprovalStatus(ExpenseStatus.APPROVED);
            expense.setCurrentApprovalStage(ApprovalStage.APPROVED);
            
            // Log final approval
            auditService.logEvent(
                approver.getEmail(),
                "FINAL_APPROVAL",
                "Expense " + expense.getId() + " fully approved",
                "SUCCESS"
            );
            
            // Send notification
            notificationService.notifyExpenseStatusChange(expense, ExpenseStatus.PENDING, ExpenseStatus.APPROVED);
            
        } else {
            expense.setCurrentApprovalStage(nextStage);
            
            // Log stage approval
            auditService.logEvent(
                approver.getEmail(),
                "STAGE_APPROVAL",
                "Expense " + expense.getId() + " approved at " + currentStage + ", moving to " + nextStage,
                "SUCCESS"
            );
            
            // Send notification for next approver
            notifyNextApprover(expense, nextStage);
        }

        expenseDAO.saveExpense(expense);
        return true;
    }

    /**
     * Process rejection action
     */
    private boolean processRejectionAction(Expense expense, ApprovalHistory history, User approver) {
        // Save rejection history
        approvalHistoryDAO.saveApprovalHistory(history);

        // Update expense status
        expense.setApprovalStatus(ExpenseStatus.REJECTED);
        expense.setCurrentApprovalStage(ApprovalStage.REJECTED);

        // Log rejection
        auditService.logEvent(
            approver.getEmail(),
            "REJECTION",
            "Expense " + expense.getId() + " rejected at " + expense.getCurrentApprovalStage(),
            "SUCCESS"
        );

        // Send notification
        notificationService.notifyExpenseStatusChange(expense, ExpenseStatus.PENDING, ExpenseStatus.REJECTED);

        expenseDAO.saveExpense(expense);
        return true;
    }

    /**
     * Get next approval stage based on current stage and expense amount
     */
    private ApprovalStage getNextApprovalStage(ApprovalStage currentStage, Expense expense) {
        double amount = expense.getAmount();
        
        switch (currentStage) {
            case PENDING_MANAGER:
                // Manager approved, determine next stage based on amount
                if (amount <= expense.getManagerApprovalThreshold()) {
                    // ₹6000-₹10000: Manager can approve directly
                    return ApprovalStage.APPROVED;
                } else if (amount <= expense.getFinanceApprovalThreshold()) {
                    // ₹10000-₹15000: Manager → Finance
                    return ApprovalStage.PENDING_FINANCE;
                } else {
                    // ₹15000+: Manager → Finance → Admin
                    return ApprovalStage.PENDING_FINANCE;
                }
                
            case PENDING_FINANCE:
                // Finance approved, determine next stage based on amount
                if (amount <= expense.getFinanceApprovalThreshold()) {
                    // ₹10000-₹15000: Finance can approve directly
                    return ApprovalStage.APPROVED;
                } else {
                    // ₹15000+: Finance → Admin
                    return ApprovalStage.PENDING_ADMIN;
                }
                
            case PENDING_ADMIN:
                // Admin approval is final
                return ApprovalStage.APPROVED;
                
            default:
                return ApprovalStage.APPROVED;
        }
    }

    /**
     * Notify the next approver in the workflow
     */
    private void notifyNextApprover(Expense expense, ApprovalStage nextStage) {
        Long nextApproverId = null;
        
        switch (nextStage) {
            case PENDING_FINANCE:
                nextApproverId = expense.getFinanceId();
                break;
            case PENDING_ADMIN:
                nextApproverId = expense.getAdminId();
                break;
        }
        
        if (nextApproverId != null) {
            // Send notification to next approver
            notificationService.notifyExpenseStatusChange(expense, ExpenseStatus.PENDING, ExpenseStatus.PENDING);
        }
    }

    /**
     * Get expenses pending approval for a specific user
     */
    public List<Expense> getExpensesPendingForUser(Long userId) {
        // This would need to be implemented in ExpenseDAO
        // For now, return all pending expenses
        return expenseDAO.getExpensesByStatus(ExpenseStatus.PENDING);
    }

    /**
     * Get approval history for an expense
     */
    public List<ApprovalHistory> getApprovalHistory(Long expenseId) {
        return approvalHistoryDAO.getApprovalHistoryByExpenseId(expenseId);
    }

    /**
     * Auto-approve expenses under threshold
     */
    public void processAutoApproval(Expense expense) {
        if (expense.getAmount() <= expense.getAutoApprovalThreshold()) {
            // Create auto-approval history
            ApprovalHistory history = new ApprovalHistory(
                expense.getId(), 
                ApprovalStage.AUTO_APPROVED, 
                ApprovalHistory.ApprovalAction.AUTO_APPROVED
            );
            history.setApproverName("System");
            history.setApproverRole("AUTO");
            history.setComment("Auto-approved: Amount under threshold");
            history.setIsAutoApproved(true);
            
            approvalHistoryDAO.saveApprovalHistory(history);
            
            // Update expense status
            expense.setApprovalStatus(ExpenseStatus.APPROVED);
            expense.setCurrentApprovalStage(ApprovalStage.AUTO_APPROVED);
            expenseDAO.saveExpense(expense);
            
            // Send notification
            notificationService.notifyExpenseStatusChange(expense, ExpenseStatus.PENDING, ExpenseStatus.APPROVED);
            
            // Log auto-approval
            auditService.logEvent(
                "system",
                "AUTO_APPROVAL",
                "Expense " + expense.getId() + " auto-approved",
                "SUCCESS"
            );
        }
    }
} 