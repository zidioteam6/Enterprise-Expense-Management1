package com.expense.management.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "approval_history")
@IdClass(ApprovalHistory.ApprovalHistoryId.class)
public class ApprovalHistory {
    
    @Id
    @Column(name = "expense_id", nullable = false)
    private Long expenseId;
    
    @Id
    @Enumerated(EnumType.STRING)
    @Column(name = "stage", nullable = false)
    private ApprovalStage stage;
    
    @Column(name = "approver_id")
    private Long approverId;
    
    @Column(name = "approver_name")
    private String approverName;
    
    @Column(name = "approver_role")
    private String approverRole;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false)
    private ApprovalAction action;
    
    @Column(name = "comment")
    private String comment;
    
    @Column(name = "action_date", nullable = false)
    private LocalDateTime actionDate;
    
    @Column(name = "is_auto_approved")
    private Boolean isAutoApproved = false;
    
    public enum ApprovalAction {
        APPROVED,
        REJECTED,
        AUTO_APPROVED
    }
    
    // Composite ID class
    public static class ApprovalHistoryId implements java.io.Serializable {
        private Long expenseId;
        private ApprovalStage stage;
        
        public ApprovalHistoryId() {}
        
        public ApprovalHistoryId(Long expenseId, ApprovalStage stage) {
            this.expenseId = expenseId;
            this.stage = stage;
        }
        
        public Long getExpenseId() {
            return expenseId;
        }
        
        public void setExpenseId(Long expenseId) {
            this.expenseId = expenseId;
        }
        
        public ApprovalStage getStage() {
            return stage;
        }
        
        public void setStage(ApprovalStage stage) {
            this.stage = stage;
        }
        
        @Override
        public boolean equals(Object obj) {
            if (this == obj) return true;
            if (obj == null || getClass() != obj.getClass()) return false;
            ApprovalHistoryId that = (ApprovalHistoryId) obj;
            return expenseId.equals(that.expenseId) && stage == that.stage;
        }
        
        @Override
        public int hashCode() {
            return expenseId.hashCode() + stage.hashCode();
        }
    }
    
    // Default constructor
    public ApprovalHistory() {}
    
    // Constructor with required fields
    public ApprovalHistory(Long expenseId, ApprovalStage stage, ApprovalAction action) {
        this.expenseId = expenseId;
        this.stage = stage;
        this.action = action;
        this.actionDate = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getExpenseId() {
        return expenseId;
    }
    
    public void setExpenseId(Long expenseId) {
        this.expenseId = expenseId;
    }
    
    public ApprovalStage getStage() {
        return stage;
    }
    
    public void setStage(ApprovalStage stage) {
        this.stage = stage;
    }
    
    public Long getApproverId() {
        return approverId;
    }
    
    public void setApproverId(Long approverId) {
        this.approverId = approverId;
    }
    
    public String getApproverName() {
        return approverName;
    }
    
    public void setApproverName(String approverName) {
        this.approverName = approverName;
    }
    
    public String getApproverRole() {
        return approverRole;
    }
    
    public void setApproverRole(String approverRole) {
        this.approverRole = approverRole;
    }
    
    public ApprovalAction getAction() {
        return action;
    }
    
    public void setAction(ApprovalAction action) {
        this.action = action;
    }
    
    public String getComment() {
        return comment;
    }
    
    public void setComment(String comment) {
        this.comment = comment;
    }
    
    public LocalDateTime getActionDate() {
        return actionDate;
    }
    
    public void setActionDate(LocalDateTime actionDate) {
        this.actionDate = actionDate;
    }
    
    public Boolean getIsAutoApproved() {
        return isAutoApproved;
    }
    
    public void setIsAutoApproved(Boolean isAutoApproved) {
        this.isAutoApproved = isAutoApproved;
    }
} 