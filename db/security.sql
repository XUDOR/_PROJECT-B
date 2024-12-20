-- Drop tables if they exist
DROP TABLE IF EXISTS company_auth CASCADE;
DROP TABLE IF EXISTS user_auth CASCADE;
DROP TABLE IF EXISTS security_events CASCADE;
DROP TABLE IF EXISTS security_alerts CASCADE;
DROP TABLE IF EXISTS failed_attempts CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;

-- Create security events table
CREATE TABLE security_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    details JSONB NOT NULL,
    severity VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create security alerts table
CREATE TABLE security_alerts (
    id SERIAL PRIMARY KEY,
    alert_type VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL,
    source_ip VARCHAR(45),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create user authentication table
CREATE TABLE user_auth (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    account_locked BOOLEAN DEFAULT false,
    password_expires_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '90 days'),
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(100)
);

-- Create company authentication table
CREATE TABLE company_auth (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    account_locked BOOLEAN DEFAULT false,
    password_expires_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '90 days'),
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(100)
);

-- Create failed login attempts table
CREATE TABLE failed_attempts (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    attempt_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    attempt_type VARCHAR(20) NOT NULL -- 'user' or 'company'
);

-- Create password reset tokens table
CREATE TABLE password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    company_id INTEGER,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT false,
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES user_auth(id) ON DELETE CASCADE,
    CONSTRAINT fk_company FOREIGN KEY(company_id) REFERENCES company_auth(id) ON DELETE CASCADE,
    CONSTRAINT check_single_owner CHECK (
        (user_id IS NOT NULL AND company_id IS NULL) OR
        (company_id IS NOT NULL AND user_id IS NULL)
    )
);

-- Create indexes for performance
CREATE INDEX idx_security_events_timestamp ON security_events(timestamp);
CREATE INDEX idx_security_alerts_timestamp ON security_alerts(timestamp);
CREATE INDEX idx_failed_attempts_username ON failed_attempts(username);
CREATE INDEX idx_failed_attempts_ip ON failed_attempts(ip_address);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_user_auth_timestamp
    BEFORE UPDATE ON user_auth
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_company_auth_timestamp
    BEFORE UPDATE ON company_auth
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Add some basic security policies
ALTER TABLE user_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Create views for monitoring
CREATE VIEW security_summary AS
SELECT 
    (SELECT COUNT(*) FROM security_alerts WHERE severity = 'high' AND timestamp > CURRENT_TIMESTAMP - INTERVAL '24 hours') as high_severity_alerts_24h,
    (SELECT COUNT(*) FROM failed_attempts WHERE attempt_time > CURRENT_TIMESTAMP - INTERVAL '1 hour') as failed_attempts_last_hour,
    (SELECT COUNT(*) FROM user_auth WHERE account_locked = true) as locked_user_accounts,
    (SELECT COUNT(*) FROM company_auth WHERE account_locked = true) as locked_company_accounts;