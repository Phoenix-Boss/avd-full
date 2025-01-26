CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    phone_number TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    profile_picture TEXT DEFAULT '',
    status_message TEXT DEFAULT 'Hey there! I am using the app.',
    contacts TEXT[],
    blocked_contacts TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);