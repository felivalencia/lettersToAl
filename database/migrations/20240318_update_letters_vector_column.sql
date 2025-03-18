-- Update the letters table to use the pgvector extension and set the correct vector dimensions

-- First make sure the vector extension is enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Then reset the emotional_vector column to be a proper 384-dimensional vector
ALTER TABLE letters 
  DROP COLUMN IF EXISTS emotional_vector;

ALTER TABLE letters 
  ADD COLUMN emotional_vector VECTOR(384);

-- Create an index for vector similarity searches
CREATE INDEX IF NOT EXISTS emotional_vector_idx 
  ON letters 
  USING ivfflat (emotional_vector vector_cosine_ops)
  WITH (lists = 100);

-- Add a comment explaining the vector dimension
COMMENT ON COLUMN letters.emotional_vector IS 'Embedding vector with 384 dimensions for semantic search'; 