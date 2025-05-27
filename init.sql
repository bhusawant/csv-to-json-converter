-- Initialize database schema for CSV to JSON converter

CREATE DATABASE IF NOT EXISTS csv_converter;
USE csv_converter;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL COMMENT 'Full name (firstName + lastName)',
  age INT NOT NULL COMMENT 'Age of the user',
  address JSON NULL COMMENT 'Address information as JSON object',
  additional_info JSON NULL COMMENT 'Additional fields as JSON object',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  INDEX idx_age (age),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for testing (optional)
-- INSERT INTO users (name, age, address, additional_info) VALUES
-- ('John Doe', 30, '{"line1": "123 Main St", "city": "New York", "state": "NY"}', '{"gender": "male", "occupation": "Engineer"}'),
-- ('Jane Smith', 25, '{"line1": "456 Oak Ave", "city": "Los Angeles", "state": "CA"}', '{"gender": "female", "occupation": "Designer"}');

-- Show table structure
DESCRIBE users;