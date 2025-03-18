-- Create the letters table for storing letter content and embeddings
CREATE TABLE letters (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  content text NOT NULL,
  drawing jsonb, -- Vector graphic data for drawings
  embedding jsonb, -- AI-generated emotional embedding as JSON array
  cluster_id integer, -- Emotional cluster ID
  created_at timestamp DEFAULT now(),
  anonymous boolean DEFAULT true,
  author_id uuid REFERENCES auth.users(id) -- optional reference to auth user if not anonymous
);

-- Create indexes for better performance
CREATE INDEX idx_letters_created_at ON letters(created_at);
CREATE INDEX idx_letters_cluster_id ON letters(cluster_id);

-- Create RLS (Row Level Security) policies for secure access
-- All users can view non-sensitive content
CREATE POLICY "Letters are viewable by everyone" 
  ON letters FOR SELECT 
  USING (true);

-- Only authenticated users can insert letters
CREATE POLICY "Authenticated users can insert letters" 
  ON letters FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Users can only update or delete their own letters
CREATE POLICY "Users can update their own letters" 
  ON letters FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own letters" 
  ON letters FOR DELETE 
  TO authenticated 
  USING (auth.uid() = author_id);

-- Enable Row Level Security
ALTER TABLE letters ENABLE ROW LEVEL SECURITY; 