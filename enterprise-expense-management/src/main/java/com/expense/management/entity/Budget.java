package com.expense.management.entity;


import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "budget")
@Data
public class Budget {
    @Id
    @Column(length = 191)
    private String category;

    @Column(name = "budget_limit")
    private double budgetLimit;

    // Constructors
    public Budget() {}

    public Budget(String category, double budgetLimit) {
        this.category = category;
        this.budgetLimit = budgetLimit;
    }

    // Getters and setters
    
}

