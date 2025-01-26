CREATE TABLE media (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    uploader UUID REFERENCES users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT CHECK (file_type IN ('image', 'video', 'voice', 'document')),
    file_size BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);