-- Function to match letters based on vector similarity
CREATE OR REPLACE FUNCTION match_letters(
  query_embedding VECTOR(384),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  user_id UUID,
  is_anonymous BOOLEAN,
  emotion TEXT,
  color TEXT,
  location TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.content,
    l.user_id,
    l.is_anonymous,
    l.emotion,
    l.color,
    l.location,
    l.created_at,
    l.updated_at,
    1 - (l.emotional_vector <=> query_embedding) as similarity
  FROM letters l
  WHERE l.emotional_vector IS NOT NULL
  AND 1 - (l.emotional_vector <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$; 