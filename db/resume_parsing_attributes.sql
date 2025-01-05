-- RESUME_PARSING_ATTRIBUTES TABLE
DROP TABLE IF EXISTS resume_parsing_attributes CASCADE;

CREATE TABLE resume_parsing_attributes (
    id SERIAL PRIMARY KEY,
    resume_id INT NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    attribute_name VARCHAR(255) NOT NULL,
    attribute_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
