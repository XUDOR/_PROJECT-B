-- USERS TABLE
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) DEFAULT 'n/a',
    address TEXT DEFAULT 'n/a',
    location TEXT DEFAULT 'n/a',
    skills TEXT[] DEFAULT ARRAY['n/a'],
    profile_summary TEXT DEFAULT 'n/a',
    latest_resume_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
