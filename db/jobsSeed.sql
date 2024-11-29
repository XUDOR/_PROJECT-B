-- Clear existing data from the jobs table
TRUNCATE TABLE jobs RESTART IDENTITY;

-- Insert seed data
INSERT INTO jobs (job_title, company_name, location, skills_required, job_description)
VALUES 
('Software Engineer', 'TechCorp', 'San Francisco', ARRAY['Java', 'AWS'], 'Develop and maintain scalable software solutions.'),
('Data Scientist', 'DataPros', 'New York', ARRAY['Python', 'Machine Learning'], 'Analyze and interpret complex datasets.');
