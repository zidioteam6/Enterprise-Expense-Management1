// package com.expense.management.model;

// import java.time.LocalDate;

// import org.springframework.format.annotation.DateTimeFormat;

// public class Expense {

//     private Long id;
//     private double amount;
//     private String category;
//     private String description;
    
//     @DateTimeFormat(pattern="YYYY-MM-DD")
//     private LocalDate date;
//     private ExpenseStatus approvalStatus;
//     private byte[] attachment; // for file attachment
//     private String attachmentType; // for file type (e.g., image/png)

//     // Default constructor
//     public Expense() {}

//     // Getters and Setters for all fields
//     public Long getId() {
//         return id;
//     }

//     public void setId(Long id) {
//         this.id = id;
//     }

//     public double getAmount() {
//         return amount;
//     }

//     public void setAmount(double amount) {
//         this.amount = amount;
//     }

//     public String getCategory() {
//         return category;
//     }

//     public void setCategory(String category) {
//         this.category = category;
//     }

//     public String getDescription() {
//         return description;
//     }

//     public void setDescription(String description) {
//         this.description = description;
//     }

//     public LocalDate getDate() {
//         return date;
//     }

//     public void setDate(LocalDate date) {
//         this.date = date;
//     }

//     public ExpenseStatus getApprovalStatus() {
//         return approvalStatus;
//     }

//     public void setApprovalStatus(ExpenseStatus approvalStatus) {
//         this.approvalStatus = approvalStatus;
//     }

//     public byte[] getAttachment() {
//         return attachment;
//     }

//     public void setAttachment(byte[] attachment) {
//         this.attachment = attachment;
//     }

//     public String getAttachmentType() {
//         return attachmentType;
//     }

//     public void setAttachmentType(String attachmentType) {
//         this.attachmentType = attachmentType;
//     }
// }


package com.expense.management.model;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

@Entity
@Table(name = "expenses")
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private double amount;

    @Column(nullable = false)
    private String category;

    private String description;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @Column(nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status")
private ExpenseStatus approvalStatus = ExpenseStatus.PENDING;
    @Lob
    @Column(name = "attachment", columnDefinition = "LONGBLOB")
    private byte[] attachment;

    @Column(name = "attachment_type")
    private String attachmentType;

    @Column(name = "employee_id")
    private Long employeeId;

    @Column(name = "auto_approval_threshold")
    private Double autoApprovalThreshold = 5000.0; // Default ₹5000
    
    @Column(name = "notify_on_approval")
    private Boolean notifyOnApproval = true;

    @Column(name = "notify_on_rejection")
    private Boolean notifyOnRejection = true;

    // Multi-level approval fields
    @Enumerated(EnumType.STRING)
    @Column(name = "current_approval_stage")
    private ApprovalStage currentApprovalStage = ApprovalStage.PENDING_MANAGER;
    
    @Column(name = "manager_approval_threshold")
    private Double managerApprovalThreshold = 10000.0; // Default ₹10000
    
    @Column(name = "finance_approval_threshold")
    private Double financeApprovalThreshold = 15000.0; // Default ₹15000
    
    @Column(name = "admin_approval_threshold")
    private Double adminApprovalThreshold = 15000.0; // Default ₹15000+
    
    @Column(name = "manager_id")
    private Long managerId;
    
    @Column(name = "finance_id")
    private Long financeId;
    
    @Column(name = "admin_id")
    private Long adminId;
    
    @Column(name = "requires_manager_approval")
    private Boolean requiresManagerApproval = true;
    
    @Column(name = "requires_finance_approval")
    private Boolean requiresFinanceApproval = true;
    
    @Column(name = "requires_admin_approval")
    private Boolean requiresAdminApproval = true;

    // Default constructor
    public Expense() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public ExpenseStatus getApprovalStatus() {
        return approvalStatus;
    }

    public void setApprovalStatus(ExpenseStatus approvalStatus) {
        this.approvalStatus = approvalStatus;
    }

    public byte[] getAttachment() {
        return attachment;
    }

    public void setAttachment(byte[] attachment) {
        this.attachment = attachment;
    }

    public String getAttachmentType() {
        return attachmentType;
    }

    public void setAttachmentType(String attachmentType) {
        this.attachmentType = attachmentType;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public Double getAutoApprovalThreshold() {
        return autoApprovalThreshold;
    }

    public void setAutoApprovalThreshold(Double autoApprovalThreshold) {
        this.autoApprovalThreshold = autoApprovalThreshold;
    }

    public Boolean getNotifyOnApproval() {
        return notifyOnApproval;
    }

    public void setNotifyOnApproval(Boolean notifyOnApproval) {
        this.notifyOnApproval = notifyOnApproval;
    }

    public Boolean getNotifyOnRejection() {
        return notifyOnRejection;
    }

    public void setNotifyOnRejection(Boolean notifyOnRejection) {
        this.notifyOnRejection = notifyOnRejection;
    }

    public ApprovalStage getCurrentApprovalStage() {
        return currentApprovalStage;
    }

    public void setCurrentApprovalStage(ApprovalStage currentApprovalStage) {
        this.currentApprovalStage = currentApprovalStage;
    }

    public Double getManagerApprovalThreshold() {
        return managerApprovalThreshold;
    }

    public void setManagerApprovalThreshold(Double managerApprovalThreshold) {
        this.managerApprovalThreshold = managerApprovalThreshold;
    }

    public Double getFinanceApprovalThreshold() {
        return financeApprovalThreshold;
    }

    public void setFinanceApprovalThreshold(Double financeApprovalThreshold) {
        this.financeApprovalThreshold = financeApprovalThreshold;
    }

    public Double getAdminApprovalThreshold() {
        return adminApprovalThreshold;
    }

    public void setAdminApprovalThreshold(Double adminApprovalThreshold) {
        this.adminApprovalThreshold = adminApprovalThreshold;
    }

    public Long getManagerId() {
        return managerId;
    }

    public void setManagerId(Long managerId) {
        this.managerId = managerId;
    }

    public Long getFinanceId() {
        return financeId;
    }

    public void setFinanceId(Long financeId) {
        this.financeId = financeId;
    }

    public Long getAdminId() {
        return adminId;
    }

    public void setAdminId(Long adminId) {
        this.adminId = adminId;
    }

    public Boolean getRequiresManagerApproval() {
        return requiresManagerApproval;
    }

    public void setRequiresManagerApproval(Boolean requiresManagerApproval) {
        this.requiresManagerApproval = requiresManagerApproval;
    }

    public Boolean getRequiresFinanceApproval() {
        return requiresFinanceApproval;
    }

    public void setRequiresFinanceApproval(Boolean requiresFinanceApproval) {
        this.requiresFinanceApproval = requiresFinanceApproval;
    }

    public Boolean getRequiresAdminApproval() {
        return requiresAdminApproval;
    }

    public void setRequiresAdminApproval(Boolean requiresAdminApproval) {
        this.requiresAdminApproval = requiresAdminApproval;
    }

    @Override
    public String toString() {
        return "Expense [id=" + id + ", amount=" + amount + ", category=" + category +
               ", description=" + description + ", date=" + date + ", status=" + approvalStatus + "]";
    }
}
