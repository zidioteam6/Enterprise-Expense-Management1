// package com.expense.management.controller;

// import com.expense.management.dto.LoginRequest;
// import com.expense.management.dto.SignupRequest;
// import com.expense.management.model.User;
// import com.expense.management.repository.UserRepository;

// import jakarta.annotation.PostConstruct;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.web.bind.annotation.*;

// import java.util.Optional;

// @CrossOrigin(origins = "http://localhost:3000")
// @RestController
// @RequestMapping("/api/auth")


// public class UserController {

//     @Autowired
//     private UserRepository userRepository;

//     @Autowired
//     private PasswordEncoder passwordEncoder;

//     @PostConstruct
//     public void testPasswordEncoderBean() {
//         System.out.println(">>> PasswordEncoder loaded: " + passwordEncoder.getClass().getName());
//     }


//     @PostMapping("/login")
//     public ResponseEntity<String> login(@RequestBody LoginRequest request) {
//         Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

//         if (userOpt.isPresent()) {
//             User user = userOpt.get();

//             if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
//                 return ResponseEntity.ok("Login successful");
//             }
//         }

//         return ResponseEntity.status(401).body("Invalid credentials");
//     }

//     @PostMapping("/signup")
//     public ResponseEntity<String> signup(@RequestBody SignupRequest request) {
//         if (userRepository.findByEmail(request.getEmail()).isPresent()) {
//             return ResponseEntity.status(400).body("Email already registered.");
//         }

//         // Hash password before saving
//         String encodedPassword = passwordEncoder.encode(request.getPassword());

//         User newUser = new User();
//         newUser.setFullName(request.getFullName());
//         newUser.setEmail(request.getEmail());
//         newUser.setPassword(encodedPassword);

//         userRepository.save(newUser);
//         return ResponseEntity.ok("User registered successfully");
//     }

// }
// package com.expense.management.controller;

// import com.expense.management.dto.LoginRequest;
// import com.expense.management.dto.SignupRequest;
// import com.expense.management.model.User;
// import com.expense.management.repository.UserRepository;

// import jakarta.annotation.PostConstruct;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.web.bind.annotation.*;

// import java.util.Map;
// import java.util.Optional;

// @CrossOrigin(origins = "http://localhost:3000")
// @RestController
// @RequestMapping("/api/auth")
// public class UserController {

//     @Autowired
//     private UserRepository userRepository;

//     @Autowired
//     private PasswordEncoder passwordEncoder;

//     @PostConstruct
//     public void testPasswordEncoderBean() {
//         System.out.println(">>> PasswordEncoder loaded: " + passwordEncoder.getClass().getName());
//     }

//     @PostMapping("/login")
//     public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest request) {
//         Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

//         if (userOpt.isPresent()) {
//             User user = userOpt.get();

//             if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
//                 return ResponseEntity.ok(Map.of("message", "Login successful"));
//             }
//         }

//         return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
//     }

//     @PostMapping("/signup")
//     public ResponseEntity<Map<String, String>> signup(@RequestBody SignupRequest request) {
//         if (userRepository.findByEmail(request.getEmail()).isPresent()) {
//             return ResponseEntity.status(400).body(Map.of("message", "Email already registered."));
//         }

//         // Hash password before saving
//         String encodedPassword = passwordEncoder.encode(request.getPassword());

//         User newUser = new User();
//         newUser.setFullName(request.getFullName());
//         newUser.setEmail(request.getEmail());
//         newUser.setPassword(encodedPassword);

//         userRepository.save(newUser);

//         return ResponseEntity.ok(Map.of("message", "User registered successfully"));
//     }
// }
// // Note: The above code assumes that the LoginRequest and SignupRequest DTOs are defined with appropriate fields.


package com.expense.management.controller;

import com.expense.management.dto.LoginRequest;
import com.expense.management.dto.SignupRequest;
import com.expense.management.model.User;
import com.expense.management.repository.UserRepository;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/auth")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostConstruct
    public void testPasswordEncoderBean() {
        System.out.println(">>> PasswordEncoder loaded: " + passwordEncoder.getClass().getName());
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                return ResponseEntity.ok(Map.of("message", "Login successful"));
            }
        }

        return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
    }

    @PostMapping("/signup")
    public ResponseEntity<Map<String, String>> signup(@RequestBody SignupRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(400).body(Map.of("message", "Email already registered."));
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());

        User newUser = new User();
        newUser.setFullName(request.getFullName());
        newUser.setEmail(request.getEmail());
        newUser.setPassword(encodedPassword);
        newUser.setRole(request.getRole()); // ✅ Set role based on user selection

        userRepository.save(newUser);

        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }
}
