package com.expense.management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.expense.management.services.SettingsService;
import com.expense.management.model.Settings;
import com.expense.management.model.Budget;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "http://localhost:3000")
public class SettingsController {

    @Autowired
    private SettingsService settingsService;

    @GetMapping("/monthly-budget")
    public ResponseEntity<Map<String, Double>> getMonthlyBudget() {
        Double budget = settingsService.getMonthlyBudget();
        return ResponseEntity.ok(Map.of("budget", budget));
    }

    @PutMapping("/monthly-budget")
    public ResponseEntity<Map<String, Double>> updateMonthlyBudget(@RequestBody Map<String, Double> request) {
        Double newBudget = request.get("budget");
        if (newBudget == null || newBudget < 0) {
            return ResponseEntity.badRequest().build();
        }
        Double updatedBudget = settingsService.updateMonthlyBudget(newBudget);
        return ResponseEntity.ok(Map.of("budget", updatedBudget));
    }

    @GetMapping("/category-budgets")
    public ResponseEntity<List<Budget>> getCategoryBudgets() {
        List<Budget> budgets = settingsService.getAllCategoryBudgets();
        return ResponseEntity.ok(budgets);
    }

    @PutMapping("/category-budget/{category}")
    public ResponseEntity<Budget> updateCategoryBudget(
            @PathVariable String category,
            @RequestBody Map<String, Double> request) {
        Double newBudget = request.get("budget");
        if (newBudget == null || newBudget < 0) {
            return ResponseEntity.badRequest().build();
        }
        Budget updatedBudget = settingsService.updateCategoryBudget(category, newBudget);
        return ResponseEntity.ok(updatedBudget);
    }
} 