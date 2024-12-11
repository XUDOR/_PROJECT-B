-- ===================================
-- Drop Existing Tables (If They Exist)
-- ===================================
DROP TABLE IF EXISTS json_store CASCADE;

-- =========================
-- Table for Storing JSON Data
-- =========================
CREATE TABLE json_store (
    id SERIAL PRIMARY KEY,
    user_json JSONB,
    job_json JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================
-- Indexes for Optimization
-- =========================
CREATE INDEX idx_json_store_created_at ON json_store(created_at);

-- =========================
-- Sample Data (Optional)
-- =========================
-- INSERT INTO json_store (user_json, job_json) VALUES
-- (
--     '{"name": "John Doe", "email": "john.doe@example.com", "skills": ["JavaScript", "React"]}',
--     '{"job_title": "Frontend Developer", "company_name": "TechCorp", "location": "Remote"}'
-- );
