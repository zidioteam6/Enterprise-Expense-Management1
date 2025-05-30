package com.expense.management.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.expense.management.model.User;
import com.expense.management.repository.UserRepository;

// In service/UserService.java
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditService auditService;

    public User updateUser(User user, String performedBy) {
        User updatedUser = userRepository.save(user);

        String changes = "Updated user: " + updatedUser.getFullName();
        auditService.log("UPDATE", "User", updatedUser.getId().toString(), performedBy, changes);

        return updatedUser;
    }
}

