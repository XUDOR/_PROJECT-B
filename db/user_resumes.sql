-- Drop the table if it exists
DROP TABLE IF EXISTS user_resumes;

-- Create the bridge table linking users to resumes
CREATE TABLE user_resumes (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_id INT NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for faster lookups
CREATE INDEX idx_user_id ON user_resumes(user_id);
CREATE INDEX idx_resume_id ON user_resumes(resume_id);
