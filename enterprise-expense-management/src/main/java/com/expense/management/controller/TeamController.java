package com.expense.management.controller;

import com.expense.management.model.User;
import com.expense.management.model.Role;
import com.expense.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;

@RestController
@RequestMapping("/api/team")
@CrossOrigin(origins = "http://localhost:3000")
public class TeamController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/members")
    public ResponseEntity<?> getTeamMembers() {
        try {
            List<User> users = userRepository.findAll();
            List<HashMap<String, Object>> members = new ArrayList<>();
            
            for (User user : users) {
                HashMap<String, Object> member = new HashMap<>();
                member.put("id", user.getId());
                member.put("fullName", user.getFullName());
                member.put("email", user.getEmail());
                member.put("role", user.getRole());
                members.add(member);
            }
            
            return ResponseEntity.ok(members);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body("Error fetching team members: " + e.getMessage());
        }
    }
} 