package com.expense.management.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import java.util.HashMap;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "*")
public class PublicSettingsController {

    private static final String DB_URL = "jdbc:mysql://localhost:3306/expense_test";
    private static final String USER = "root";
    private static final String PASS = "root";

    @GetMapping("/budget")
    public ResponseEntity<Map<String, Object>> getBudget() {
        try (Connection conn = DriverManager.getConnection(DB_URL, USER, PASS)) {
            String sql = "SELECT setting_value FROM settings WHERE setting_key = 'monthly_budget'";
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                ResultSet rs = stmt.executeQuery();
                if (rs.next()) {
                    double budget = Double.parseDouble(rs.getString("setting_value"));
                    Map<String, Object> response = new HashMap<>();
                    response.put("budget", budget);
                    return ResponseEntity.ok(response);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return ResponseEntity.ok(Map.of("budget", 50000.0)); // Default value if something goes wrong
    }

    @PutMapping("/budget")
    public ResponseEntity<Map<String, Object>> updateBudget(@RequestBody Map<String, Double> request) {
        Double newBudget = request.get("budget");
        if (newBudget == null || newBudget < 0) {
            return ResponseEntity.badRequest().build();
        }

        try (Connection conn = DriverManager.getConnection(DB_URL, USER, PASS)) {
            String sql = "UPDATE settings SET setting_value = ? WHERE setting_key = 'monthly_budget'";
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, String.valueOf(newBudget));
                stmt.executeUpdate();
                
                Map<String, Object> response = new HashMap<>();
                response.put("budget", newBudget);
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
} 