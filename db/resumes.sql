-- Drop the resumes table if it exists
DROP TABLE IF EXISTS resumes;

-- Create the resumes table
CREATE TABLE resumes (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id INT DEFAULT NULL,
    profile_id INT DEFAULT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) CHECK (file_type IN ('pdf', 'docx')),
    jsondb_id INT DEFAULT NULL REFERENCES jsonDB(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
