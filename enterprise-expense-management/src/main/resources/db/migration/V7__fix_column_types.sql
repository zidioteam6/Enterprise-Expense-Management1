-- First, update any NULL roles to 'EMPLOYEE'
UPDATE users SET role = 'EMPLOYEE' WHERE role IS NULL;

-- Now modify the role column to use the correct enum values
ALTER TABLE users MODIFY COLUMN role ENUM('EMPLOYEE', 'MANAGER', 'ADMIN') NOT NULL DEFAULT 'EMPLOYEE';

-- Modify the attachment column to use LONGBLOB
ALTER TABLE expenses MODIFY COLUMN attachment LONGBLOB;

-- Fix role column to use correct enum values
-- First, let's see what values we have
CREATE TEMPORARY TABLE temp_roles AS
SELECT DISTINCT role FROM users;

-- Update any invalid roles to EMPLOYEE
UPDATE users 
SET role = 'EMPLOYEE' 
WHERE role NOT IN ('EMPLOYEE', 'MANAGER', 'ADMIN');

-- Now we can safely modify the column
ALTER TABLE users MODIFY COLUMN role ENUM('EMPLOYEE', 'MANAGER', 'ADMIN') NOT NULL;

-- Clean up
DROP TEMPORARY TABLE IF EXISTS temp_roles; 