-- Fix approval_history table structure
-- Remove the auto-increment id column and make expense_id + stage the composite primary key

-- First, drop the existing table
DROP TABLE IF EXISTS approval_history;

-- Create the corrected table
CREATE TABLE approval_history (
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