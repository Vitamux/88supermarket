-- Add district column to stores if it doesn't exist
ALTER TABLE stores ADD COLUMN IF NOT EXISTS district TEXT;

-- Add description column to products if it doesn't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS description JSONB;

-- Note: We are keeping 'name' as text for backward compatibility for now, 
-- but ensuring 'display_names' (JSONB) is the primary source for multilingual names.
-- If 'display_names' doesn't exist, create it.
ALTER TABLE products ADD COLUMN IF NOT EXISTS display_names JSONB DEFAULT '{"en": "", "ru": "", "am": ""}';
