-- Drop the table if it exists
DROP TABLE IF EXISTS resume_parsing_attributes;

-- Create the table to store parsed attributes from resumes
CREATE TABLE resume_parsing_attributes (
    id SERIAL PRIMARY KEY,
    resume_id INT NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    attribute_name VARCHAR(255) NOT NULL,
    attribute_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for resume_id for faster lookups
CREATE INDEX idx_resume_id ON resume_parsing_attributes(resume_id);
