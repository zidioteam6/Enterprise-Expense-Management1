package com.expense.management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.expense.management.services.SettingsService;
import java.util.Map;

@RestController
@RequestMapping("/api/simple-settings")
@CrossOrigin(origins = "*")
public class SimpleSettingsController {

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
} 