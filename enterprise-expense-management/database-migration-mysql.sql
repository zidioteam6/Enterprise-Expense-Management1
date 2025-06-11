-- Database Migration for Multi-Level Approval Workflow (MySQL)
-- Run this script to update your database schema

-- 1. Create approval_history table
CREATE TABLE IF NOT EXISTS approval_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    expense_id BIGINT NOT NULL,
    stage VARCHAR(50) NOT NULL,
    approver_id BIGINT,
    approver_name VARCHAR(255),
    approver_role VARCHAR(50),
    action VARCHAR(50) NOT NULL,
    comment TEXT,
    action_date DATETIME NOT NULL,
    is_auto_approved BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE
);

-- 2. Add new columns to expenses table
ALTER TABLE expenses ADD COLUMN current_approval_stage VARCHAR(50) DEFAULT 'PENDING_MANAGER';
ALTER TABLE expenses ADD COLUMN manager_approval_threshold DOUBLE DEFAULT 1000.0;
ALTER TABLE expenses ADD COLUMN finance_approval_threshold DOUBLE DEFAULT 5000.0;
ALTER TABLE expenses ADD COLUMN admin_approval_threshold DOUBLE DEFAULT 10000.0;
ALTER TABLE expenses ADD COLUMN manager_id BIGINT;
ALTER TABLE expenses ADD COLUMN finance_id BIGINT;
ALTER TABLE expenses ADD COLUMN admin_id BIGINT;
ALTER TABLE expenses ADD COLUMN requires_manager_approval BOOLEAN DEFAULT TRUE;
ALTER TABLE expenses ADD COLUMN requires_finance_approval BOOLEAN DEFAULT TRUE;
ALTER TABLE expenses ADD COLUMN requires_admin_approval BOOLEAN DEFAULT TRUE;

-- 3. Create indexes for performance
CREATE INDEX idx_approval_history_expense_id ON approval_history(expense_id);
CREATE INDEX idx_approval_history_stage ON approval_history(stage);
CREATE INDEX idx_approval_history_approver_id ON approval_history(approver_id);
CREATE INDEX idx_expenses_current_stage ON expenses(current_approval_stage);
CREATE INDEX idx_expenses_manager_id ON expenses(manager_id);
CREATE INDEX idx_expenses_finance_id ON expenses(finance_id);
CREATE INDEX idx_expenses_admin_id ON expenses(admin_id);

-- 4. Update existing expenses to have proper approval stages
UPDATE expenses 
SET current_approval_stage = CASE 
    WHEN amount <= 1000 THEN 'AUTO_APPROVED'
    WHEN amount <= 5000 THEN 'PENDING_MANAGER'
    WHEN amount <= 10000 THEN 'PENDING_FINANCE'
    ELSE 'PENDING_ADMIN'
END
WHERE current_approval_stage IS NULL OR current_approval_stage = 'PENDING_MANAGER';

-- 5. Insert approval history for existing auto-approved expenses
INSERT INTO approval_history (expense_id, stage, approver_name, approver_role, action, comment, action_date, is_auto_approved)
SELECT 
    id,
    'AUTO_APPROVED',
    'System',
    'AUTO',
    'AUTO_APPROVED',
    'Auto-approved: Amount under threshold',
    NOW(),
    TRUE
FROM expenses 
WHERE current_approval_stage = 'AUTO_APPROVED' 
AND approval_status = 'APPROVED';

-- 6. Verify the migration
SELECT 'Migration completed successfully!' as status;
SELECT COUNT(*) as total_expenses FROM expenses;
SELECT COUNT(*) as total_approval_history FROM approval_history;
SELECT current_approval_stage, COUNT(*) as count FROM expenses GROUP BY current_approval_stage; 