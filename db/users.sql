-- Drop the table if it exists (to start fresh)
DROP TABLE IF EXISTS users;

-- Create the `users` table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) DEFAULT 'n/a',
    address TEXT DEFAULT 'n/a', -- New field for address
    location TEXT DEFAULT 'n/a', -- Updated with default value
    skills TEXT[] DEFAULT ARRAY['n/a'], -- Default empty array with 'n/a'
    profile_summary TEXT DEFAULT 'n/a', -- New field for profile summary
    latest_resume_id INT DEFAULT NULL, -- Links to resumes.id
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
