-- Insert sample data into the `users` table
INSERT INTO users (name, email, phone, location, skills, profile_summary)
VALUES
    ('Alice Johnson', 'alice@example.com', '123-456-7890', 'Springfield, IL', 
     ARRAY['JavaScript', 'React', 'Node.js'], 'Frontend developer with 5 years of experience.'),
    ('Bob Smith', 'bob@example.com', '987-654-3210', NULL, 
     ARRAY['Python', 'Django', 'PostgreSQL'], 'Backend developer specializing in database optimization.'),
    ('Clara Kim', 'clara@example.com', NULL, 'Seattle, WA', 
     ARRAY['Java', 'Spring Boot', 'AWS'], 'Full-stack developer with a focus on cloud architecture.');
