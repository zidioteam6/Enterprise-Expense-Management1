-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(255) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default monthly budget
INSERT INTO settings (setting_key, setting_value, description)
VALUES ('monthly_budget', '50000', 'Monthly budget limit for expenses')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value); 