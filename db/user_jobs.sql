-- Drop the table if it exists
DROP TABLE IF EXISTS user_jobs;

-- Create the bridge table linking users to jobs
CREATE TABLE user_jobs (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id INT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    application_status VARCHAR(50) DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for faster lookups
CREATE INDEX idx_user_id ON user_jobs(user_id);
CREATE INDEX idx_job_id ON user_jobs(job_id);
