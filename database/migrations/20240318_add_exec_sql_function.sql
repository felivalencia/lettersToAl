-- Create a function to execute arbitrary SQL
-- This allows our migration script to run SQL commands safely

CREATE OR REPLACE FUNCTION exec_sql(sql text) 
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 