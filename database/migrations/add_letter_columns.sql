-- Migration: Add missing columns to letters table
-- This adds color, emotion, location, and username columns to the letters table

-- Add color column (varchar to store hex color code or color name)
ALTER TABLE letters ADD COLUMN IF NOT EXISTS color VARCHAR;

-- Add emotion column (varchar to store emotion name)
ALTER TABLE letters ADD COLUMN IF NOT EXISTS emotion VARCHAR;

-- Add location column (varchar to store location data)
ALTER TABLE letters ADD COLUMN IF NOT EXISTS location VARCHAR;

-- Add username column (for storing the username directly with the letter)
ALTER TABLE letters ADD COLUMN IF NOT EXISTS username VARCHAR;

-- Ensure the emotional_vector column exists (in case it was renamed)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'letters' AND column_name = 'embedding') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'letters' AND column_name = 'emotional_vector') THEN
            -- Rename emotional_vector to embedding to match our code expectation
            ALTER TABLE letters RENAME COLUMN emotional_vector TO embedding;
        ELSE
            -- Create embedding column if neither exists
            ALTER TABLE letters ADD COLUMN embedding VECTOR;
        END IF;
    END IF;
END
$$; 