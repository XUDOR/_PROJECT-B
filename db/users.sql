-- Drop the table if it exists (to start fresh)
DROP TABLE IF EXISTS users;

-- Create the `users` table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    location TEXT,
    skills TEXT[],
    profile_summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
