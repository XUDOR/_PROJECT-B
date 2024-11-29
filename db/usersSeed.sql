-- Clear existing data from the users table
TRUNCATE TABLE users RESTART IDENTITY;


-- Insert sample data into the `users` table
INSERT INTO users (name, email, phone, address, location, skills, profile_summary)
VALUES
    ('Alice Johnson', 'alice@example.com', '123-456-7890', '123 Main St, Springfield, IL', 
     'Springfield, IL', ARRAY['JavaScript', 'React', 'Node.js'], 
     'Frontend developer with 5 years of experience.'),
    ('Bob Smith', 'bob@example.com', '987-654-3210', 'n/a', 
     'n/a', ARRAY['Python', 'Django', 'PostgreSQL'], 
     'Backend developer specializing in database optimization.'),
    ('Clara Kim', 'clara@example.com', 'n/a', '456 Pine St, Seattle, WA', 
     'Seattle, WA', ARRAY['Java', 'Spring Boot', 'AWS'], 
     'Full-stack developer with a focus on cloud architecture.');
