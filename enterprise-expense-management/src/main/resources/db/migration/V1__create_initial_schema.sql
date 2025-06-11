-- Initial database schema with FINANCE role support
-- Create users table with all roles including FINANCE

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('EMPLOYEE', 'MANAGER', 'FINANCE', 'ADMIN') NOT NULL DEFAULT 'EMPLOYEE',
    profile_image LONGBLOB,
    profile_image_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    amount DOUBLE NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    approval_status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    attachment LONGBLOB,
    attachment_type VARCHAR(100),
    employee_id BIGINT,
    auto_approval_threshold DOUBLE DEFAULT 5000.0,
    notify_on_approval BOOLEAN DEFAULT TRUE,
    notify_on_rejection BOOLEAN DEFAULT TRUE,
    current_approval_stage ENUM('PENDING_MANAGER', 'PENDING_FINANCE', 'PENDING_ADMIN', 'APPROVED', 'REJECTED', 'AUTO_APPROVED') DEFAULT 'PENDING_MANAGER',
    manager_approval_threshold DOUBLE DEFAULT 10000.0,
    finance_approval_threshold DOUBLE DEFAULT 15000.0,
    admin_approval_threshold DOUBLE DEFAULT 15000.0,
    manager_id BIGINT,
    finance_id BIGINT,
    admin_id BIGINT,
    requires_manager_approval BOOLEAN DEFAULT TRUE,
    requires_finance_approval BOOLEAN DEFAULT TRUE,
    requires_admin_approval BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create approval_history table
CREATE TABLE IF NOT EXISTS approval_history (
    expense_id BIGINT NOT NULL,
    stage ENUM('PENDING_MANAGER', 'PENDING_FINANCE', 'PENDING_ADMIN', 'APPROVED', 'REJECTED', 'AUTO_APPROVED') NOT NULL,
    approver_id BIGINT,
    approver_name VARCHAR(255),
    approver_role VARCHAR(50),
    action ENUM('APPROVED', 'REJECTED', 'AUTO_APPROVED') NOT NULL,
    comment TEXT,
    action_date DATETIME NOT NULL,
    is_auto_approved BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (expense_id, stage),
    FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
    FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create budget table
CREATE TABLE IF NOT EXISTS budget (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    amount DOUBLE NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_month_year (user_id, month, year)
);

-- Insert default settings
INSERT INTO settings (setting_key, setting_value, description) VALUES
('monthly_budget', '50000', 'Default monthly budget for employees'),
('auto_approval_threshold', '5000', 'Amount below which expenses are auto-approved'),
('manager_approval_threshold', '10000', 'Amount below which manager can approve directly'),
('finance_approval_threshold', '15000', 'Amount below which finance can approve directly'),
('admin_approval_threshold', '15000', 'Amount above which admin approval is required');

-- Insert sample users for testing (optional)
INSERT INTO users (full_name, email, password, role) VALUES
('Admin User', 'admin@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN'),
('Manager User', 'manager@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'MANAGER'),
('Finance User', 'finance@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'FINANCE'),
('Employee User', 'employee@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'EMPLOYEE'); 