package com.expense.management.controller;

import com.expense.management.model.Role;
import com.expense.management.model.User;
import com.expense.management.repository.RoleRepository;
import com.expense.management.repository.UserRepository;
import com.expense.management.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping(value = "/login", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.get("email"),
                    loginRequest.get("password")
                )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = tokenProvider.generateToken(authentication);
            
            User user = userRepository.findByEmail(loginRequest.get("email"))
                .orElseThrow(() -> new RuntimeException("User not found after authentication"));

            String roleName = (user.getRole() != null) ? user.getRole().getName() : "UNKNOWN_ROLE";

            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("user", Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "fullName", user.getFullName(),
                "role", roleName
            ));

            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(response);
        } catch (Exception e) {
            System.err.println("Login error: " + e.getMessage());
            return ResponseEntity.badRequest()
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("message", "Invalid email or password. Details: " + e.getMessage()));
        }
    }

    @PostMapping(value = "/signup", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> signup(@RequestBody Map<String, String> signupRequest) {
        try {
            // Validate required fields
            if (!signupRequest.containsKey("email") || !signupRequest.containsKey("password") 
                || !signupRequest.containsKey("fullName") || !signupRequest.containsKey("role")) {
                return ResponseEntity.badRequest()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("message", "Missing required fields"));
            }

            // Check if email already exists
            if (userRepository.existsByEmail(signupRequest.get("email"))) {
                return ResponseEntity.badRequest()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("message", "Email is already taken"));
            }

            // Get or create role
            String roleName = "ROLE_" + signupRequest.get("role").toUpperCase();
            Role role = roleRepository.findByName(roleName)
                .orElseGet(() -> {
                    Role defaultRole = new Role();
                    defaultRole.setName("ROLE_EMPLOYEE");
                    return roleRepository.save(defaultRole);
                });

            // Create new user
            User user = new User();
            user.setEmail(signupRequest.get("email"));
            user.setPassword(passwordEncoder.encode(signupRequest.get("password")));
            user.setFullName(signupRequest.get("fullName"));
            user.setRole(role);

            user = userRepository.save(user);

            // Return success response
            Map<String, Object> response = new HashMap<>();
            response.put("message", "User registered successfully");
            response.put("user", Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "fullName", user.getFullName(),
                "role", user.getRole().getName()
            ));

            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("message", "Error during signup: " + e.getMessage()));
        }
    }
} 