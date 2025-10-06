-- Insert default admin user
INSERT INTO users (name, email, password, role, is_active) 
VALUES (
    'System Administrator', 
    'admin@reverside.com', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: admin123
    'admin', 
    true
) ON CONFLICT (email) DO NOTHING;
