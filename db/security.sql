-- ==================================
-- security.sql (Updated with Fixes)
-- ==================================

-- Drop tables if they exist
DROP TABLE IF EXISTS auth_logs CASCADE;
DROP TABLE IF EXISTS suspicious_activities CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS failed_attempts CASCADE;
DROP TABLE IF EXISTS security_alerts CASCADE;
DROP TABLE IF EXISTS security_events CASCADE;
DROP TABLE IF EXISTS company_auth CASCADE;
DROP TABLE IF EXISTS user_auth CASCADE;
DROP TABLE IF EXISTS jwt_tokens CASCADE;

-- ==================================
-- Core Security Tables
-- ==================================

-- Create security_events table
CREATE TABLE security_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    details JSONB NOT NULL,
    severity VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create security_alerts table
CREATE TABLE security_alerts (
    id SERIAL PRIMARY KEY,
    alert_type VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL,
    source_ip VARCHAR(45),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create user_auth table
CREATE TABLE user_auth (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(100) NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    account_locked BOOLEAN DEFAULT false,
    password_expires_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '90 days'),
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(100)
);

-- Create company_auth table
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
    attempt_type VARCHAR(20) NOT NULL  -- 'user' or 'company'
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
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES user_auth(id) ON DELETE CASCADE,
    CONSTRAINT fk_company FOREIGN KEY (company_id) REFERENCES company_auth(id) ON DELETE CASCADE,
    CONSTRAINT check_single_owner CHECK (
        (user_id IS NOT NULL AND company_id IS NULL) OR
        (company_id IS NOT NULL AND user_id IS NULL)
    )
);

-- ==================================
-- Authentication Logging Tables
-- ==================================

-- Create auth_logs table
CREATE TABLE auth_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    username VARCHAR(100),
    ip_address VARCHAR(45),
    status VARCHAR(50),
    details JSONB,
    jwt_id VARCHAR(100), -- Corrected to align with code
    auth_action VARCHAR(50),
    activity_type VARCHAR(50) NOT NULL DEFAULT 'UNKNOWN',
    severity VARCHAR(20),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create suspicious_activities table
CREATE TABLE suspicious_activities (
    id SERIAL PRIMARY KEY,
    activity_type VARCHAR(100),
    description TEXT,
    threat_level VARCHAR(20),
    source_ip VARCHAR(45),
    target VARCHAR(100),
    details JSONB,
    status VARCHAR(50),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==================================
-- JWT Token Tracking
-- ==================================

-- Create JWT tokens table
CREATE TABLE jwt_tokens (
    id SERIAL PRIMARY KEY,
    token_id VARCHAR(100) NOT NULL,
    user_id INTEGER NOT NULL,
    issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    last_used_at TIMESTAMP,
    is_revoked BOOLEAN DEFAULT false,
    revoked_at TIMESTAMP,
    revocation_reason VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    CONSTRAINT fk_user_auth
        FOREIGN KEY(user_id)
        REFERENCES user_auth(id)
        ON DELETE CASCADE
);

-- Create view for active tokens
CREATE VIEW active_tokens AS
SELECT 
    jt.*,
    ua.username,
    ua.email
FROM jwt_tokens jt
JOIN user_auth ua ON jt.user_id = ua.id
WHERE 
    NOT jt.is_revoked 
    AND jt.expires_at > CURRENT_TIMESTAMP;

-- ==================================
-- Indexes for Performance
-- ==================================
CREATE INDEX idx_security_events_timestamp ON security_events(timestamp);
CREATE INDEX idx_security_alerts_timestamp ON security_alerts(timestamp);
CREATE INDEX idx_failed_attempts_username ON failed_attempts(username);
CREATE INDEX idx_failed_attempts_ip ON failed_attempts(ip_address);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_auth_logs_timestamp ON auth_logs(timestamp);
CREATE INDEX idx_suspicious_activities_timestamp ON suspicious_activities(timestamp);
CREATE INDEX idx_jwt_tokens_user ON jwt_tokens(user_id);
CREATE INDEX idx_jwt_tokens_token_id ON jwt_tokens(token_id);
CREATE INDEX idx_jwt_tokens_is_revoked ON jwt_tokens(is_revoked);

-- ==================================
-- Functions & Triggers
-- ==================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- JWT audit function
CREATE OR REPLACE FUNCTION log_jwt_operation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO security_events (
        event_type,
        details,
        severity,
        timestamp
    ) VALUES (
        CASE
            WHEN TG_OP = 'INSERT' THEN 'JWT_ISSUED'
            WHEN TG_OP = 'UPDATE' AND NEW.is_revoked = true THEN 'JWT_REVOKED'
            ELSE 'JWT_MODIFIED'
        END,
        jsonb_build_object(
            'token_id', COALESCE(NEW.token_id, OLD.token_id),
            'user_id', COALESCE(NEW.user_id, OLD.user_id),
            'operation', TG_OP,
            'ip_address', COALESCE(NEW.ip_address, OLD.ip_address)
        ),
        'info',
        CURRENT_TIMESTAMP
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==================================
-- Triggers
-- ==================================
CREATE TRIGGER update_user_auth_timestamp
    BEFORE UPDATE ON user_auth
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_company_auth_timestamp
    BEFORE UPDATE ON company_auth
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER jwt_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON jwt_tokens
    FOR EACH ROW EXECUTE FUNCTION log_jwt_operation();

-- ==================================
-- Security Policies
-- ==================================
ALTER TABLE user_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE jwt_tokens ENABLE ROW LEVEL SECURITY;

-- ==================================
-- Monitoring Views
-- ==================================
CREATE VIEW security_summary AS
SELECT 
    (
        SELECT COUNT(*) 
        FROM security_alerts 
        WHERE severity = 'high' 
        AND timestamp > CURRENT_TIMESTAMP - INTERVAL '24 hours'
    ) AS high_severity_alerts_24h,
    (
        SELECT COUNT(*) 
        FROM failed_attempts 
        WHERE attempt_time > CURRENT_TIMESTAMP - INTERVAL '1 hour'
    ) AS failed_attempts_last_hour,
    (
        SELECT COUNT(*)
        FROM user_auth 
        WHERE account_locked = true
    ) AS locked_user_accounts,
    (
        SELECT COUNT(*)
        FROM company_auth 
        WHERE account_locked = true
    ) AS locked_company_accounts,
    (
        SELECT COUNT(*)
        FROM jwt_tokens
        WHERE NOT is_revoked AND expires_at > CURRENT_TIMESTAMP
    ) AS active_tokens_count;
