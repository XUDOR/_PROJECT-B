-- Clear existing table if it exists
DROP TABLE IF EXISTS jobs;

-- Create the table
CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    job_title VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    skills_required TEXT[],
    job_description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
