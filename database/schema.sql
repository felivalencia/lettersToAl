-- Create users table with authentication info
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create letters table with foreign key to users
CREATE TABLE letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  emotional_vector VECTOR(384), -- Assuming 384-dimension embedding
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create RLS (Row Level Security) policies for data access

-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE letters ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Create policies for letters table
CREATE POLICY "Letters are viewable by everyone" ON letters
  FOR SELECT USING (true);
  
CREATE POLICY "Users can insert their own letters" ON letters
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own letters" ON letters
  FOR UPDATE USING (auth.uid() = user_id);

-- Create functions for managing users

-- Function to create a new user with bcrypt hashed password
CREATE OR REPLACE FUNCTION create_user(
  username TEXT,
  email TEXT,
  password TEXT
) RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  INSERT INTO users (username, email, password_hash)
  VALUES (username, email, crypt(password, gen_salt('bf')))
  RETURNING id INTO new_user_id;
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to authenticate a user
CREATE OR REPLACE FUNCTION authenticate_user(
  input_username TEXT,
  input_password TEXT
) RETURNS TABLE (
  id UUID,
  username TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.username
  FROM users u
  WHERE u.username = input_username
  AND u.password_hash = crypt(input_password, u.password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indices for performance
CREATE INDEX idx_letters_user_id ON letters(user_id);
CREATE INDEX idx_letters_created_at ON letters(created_at);

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_letters_updated_at
BEFORE UPDATE ON letters
FOR EACH ROW EXECUTE PROCEDURE update_modified_column(); 