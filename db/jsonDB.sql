-- jsonDB.sql

-- =========================
-- Table for Bundled JSON
-- =========================
CREATE TABLE user_job_bundles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    job_id INTEGER REFERENCES jobs(id),
    bundle JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================
-- Indexes for Optimization
-- =========================
CREATE INDEX idx_user_job_bundles_user_id ON user_job_bundles(user_id);
CREATE INDEX idx_user_job_bundles_job_id ON user_job_bundles(job_id);
CREATE INDEX idx_user_job_bundles_created_at ON user_job_bundles(created_at);

-- =========================
-- Sample Data (Optional)
-- =========================
-- INSERT INTO user_job_bundles (user_id, job_id, bundle) VALUES
-- (1, 2, '{"user": "John Doe", "job": "Software Engineer"}');
