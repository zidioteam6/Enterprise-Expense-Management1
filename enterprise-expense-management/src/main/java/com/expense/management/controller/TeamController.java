package com.expense.management.controller;

import com.expense.management.model.User;
import com.expense.management.model.Role;
import com.expense.management.model.Expense;
import com.expense.management.model.ExpenseStatus;
import com.expense.management.repository.UserRepository;
import com.expense.management.dao.ExpenseDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/team")
@CrossOrigin(origins = "http://localhost:3000")
public class TeamController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ExpenseDAO expenseDAO;

    @GetMapping("/members")
    public ResponseEntity<?> getTeamMembers() {
        try {
            // ✅ Show all employees to any manager (no manager_id filtering)
            List<User> employees = userRepository.findByRole(Role.EMPLOYEE);
            
            List<HashMap<String, Object>> members = new ArrayList<>();
            
            for (User user : employees) {
                HashMap<String, Object> member = new HashMap<>();
                member.put("id", user.getId());
                member.put("name", user.getFullName());
                member.put("role", user.getRole());
                member.put("email", user.getEmail());
                member.put("avatar", user.getFullName().substring(0, 2).toUpperCase());
                
                // ✅ Get expense statistics for this team member
                List<Expense> userExpenses = expenseDAO.getExpensesByEmployeeId(user.getId());
                double totalExpenses = userExpenses.stream()
                    .mapToDouble(Expense::getAmount)
                    .sum();
                long pendingClaims = userExpenses.stream()
                    .filter(exp -> exp.getApprovalStatus() == ExpenseStatus.PENDING)
                    .count();
                
                member.put("totalExpenses", totalExpenses);
                member.put("pendingClaims", pendingClaims);
                member.put("department", "General"); // You can add department field later
                
                members.add(member);
            }
            
            return ResponseEntity.ok(members);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body("Error fetching team members: " + e.getMessage());
        }
    }
    
    // ✅ Add endpoint to get team statistics
    @GetMapping("/stats")
    public ResponseEntity<?> getTeamStats() {
        try {
            List<User> employees = userRepository.findByRole(Role.EMPLOYEE);
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("teamSize", employees.size());
            
            // Calculate team expense statistics
            double totalTeamExpenses = 0;
            int totalPendingClaims = 0;
            
            for (User employee : employees) {
                List<Expense> userExpenses = expenseDAO.getExpensesByEmployeeId(employee.getId());
                totalTeamExpenses += userExpenses.stream()
                    .mapToDouble(Expense::getAmount)
                    .sum();
                totalPendingClaims += userExpenses.stream()
                    .filter(exp -> exp.getApprovalStatus() == ExpenseStatus.PENDING)
                    .count();
            }
            
            stats.put("totalTeamExpenses", totalTeamExpenses);
            stats.put("totalPendingClaims", totalPendingClaims);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body("Error fetching team stats: " + e.getMessage());
        }
    }
} 