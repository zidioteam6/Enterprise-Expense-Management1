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

import org.hibernate.annotations.CreationTimestamp;
import org.springframework.boot.context.properties.bind.DefaultValue;
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
import lombok.Data;

@Data
@Entity
@Table(name = "expenses")
public class Expense {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

//	@Column(nullable = false)
	private double amount;

//	@Column(nullable = false)
	private String category;

	private String description;

//	@DateTimeFormat(pattern = "yyyy-MM-dd")
	@CreationTimestamp
//	@Column(nullable = false)
	private LocalDate date;

	@Enumerated(EnumType.STRING)
	@Column(name = "approval_status")
	private ExpenseStatus approvalStatus = ExpenseStatus.PENDING;
	
	@Column(name= "priority")
	private String priority;
	
	@Lob
	private byte[] attachment;

	@Column(name = "attachment_type")
	private String attachmentType;

	// Default constructor
//	public Expense() {
//	}
//
//	@Override
//	public String toString() {
//		return "Expense [id=" + id + ", amount=" + amount + ", category=" + category + ", description=" + description
//				+ ", date=" + date + ", status=" + approvalStatus + "]";
//	}
}
