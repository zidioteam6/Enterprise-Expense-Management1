package com.expense.management.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.expense.management.dao.SettingsDAO;
import com.expense.management.dao.BudgetDAO;
import com.expense.management.model.Settings;
import com.expense.management.model.Budget;
import java.util.List;

@Service
public class SettingsService {

    @Autowired
    private SettingsDAO settingsDAO;

    @Autowired
    private BudgetDAO budgetDAO;

    @Transactional
    public Double getMonthlyBudget() {
        Settings settings = settingsDAO.getSettings();
        return settings != null ? settings.getMonthlyBudget() : 0.0;
    }

    @Transactional
    public Double updateMonthlyBudget(Double newBudget) {
        Settings settings = settingsDAO.getSettings();
        if (settings == null) {
            settings = new Settings();
        }
        settings.setMonthlyBudget(newBudget);
        settingsDAO.saveSettings(settings);
        return newBudget;
    }

    @Transactional
    public List<Budget> getAllCategoryBudgets() {
        return budgetDAO.getAllBudgets();
    }

    @Transactional
    public Budget updateCategoryBudget(String category, Double newBudget) {
        Budget budget = budgetDAO.getBudgetByCategory(category);
        if (budget == null) {
            budget = new Budget();
            budget.setCategory(category);
        }
        budget.setBudgetLimit(newBudget);
        return budgetDAO.saveBudget(budget);
    }
} 