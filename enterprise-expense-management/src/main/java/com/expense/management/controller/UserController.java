package com.expense.management.controller;

import com.expense.management.dto.LoginRequest;
import com.expense.management.dto.SignupRequest;
import com.expense.management.model.User;
import com.expense.management.repository.UserRepository;
import com.expense.management.services.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/auth")
public class UserController {
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditService auditService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request) {
        try {
            logger.info("Login attempt for email: {}", request.getEmail());
            
            // Get user details from database
            User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    logger.error("User not found for email: {}", request.getEmail());
                    auditService.logEvent(
                        request.getEmail(),
                        "LOGIN",
                        "Failed login attempt - User not found",
                        "FAILED"
                    );
                    return new RuntimeException("User not found");
                });

            // Verify password
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                logger.error("Invalid password for user: {}", request.getEmail());
                auditService.logEvent(
                    request.getEmail(),
                    "LOGIN",
                    "Failed login attempt - Invalid password",
                    "FAILED"
                );
                return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
            }

            // Create response with user details
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful");
            response.put("email", user.getEmail());
            response.put("fullName", user.getFullName());
            response.put("role", user.getRole());
            response.put("userId", user.getId());

            // Log successful login
            auditService.logEvent(
                user.getEmail(),
                "LOGIN",
                "Successful login",
                "SUCCESS"
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Login error: ", e);
            return ResponseEntity.status(500).body(Map.of("message", "Login failed: " + e.getMessage()));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        try {
            // Check if user already exists
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email already registered"));
            }

            // Create new user
            User user = new User();
            user.setEmail(request.getEmail());
            user.setFullName(request.getFullName());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setRole(request.getRole());

            // Save user
            userRepository.save(user);

            // Log successful signup
            auditService.logEvent(
                user.getEmail(),
                "SIGNUP",
                "New user registration",
                "SUCCESS"
            );

            return ResponseEntity.ok(Map.of("message", "User registered successfully"));
        } catch (Exception e) {
            logger.error("Signup error: ", e);
            return ResponseEntity.status(500).body(Map.of("message", "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping(value = "/profile-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadProfileImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") Long userId) {
        try {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Please select a file"));
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || (!contentType.startsWith("image/") && !contentType.equals("application/pdf"))) {
                return ResponseEntity.badRequest().body(Map.of("message", "Only image and PDF files are allowed"));
            }

            // Save file data
            user.setProfileImage(file.getBytes());
            user.setProfileImageType(contentType);
            userRepository.save(user);

            auditService.logEvent(
                user.getEmail(),
                "PROFILE_UPDATE",
                "Profile image updated",
                "SUCCESS"
            );

            return ResponseEntity.ok(Map.of("message", "Profile image updated successfully"));
        } catch (Exception e) {
            logger.error("Profile image upload error: ", e);
            return ResponseEntity.status(500).body(Map.of("message", "Failed to upload profile image: " + e.getMessage()));
        }
    }

    @GetMapping("/profile-image/{userId}")
    public ResponseEntity<?> getProfileImage(@PathVariable Long userId) {
        try {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

            if (user.getProfileImage() == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(user.getProfileImageType()))
                .body(user.getProfileImage());
        } catch (Exception e) {
            logger.error("Profile image fetch error: ", e);
            return ResponseEntity.status(500).body(Map.of("message", "Failed to fetch profile image: " + e.getMessage()));
        }
    }
}
