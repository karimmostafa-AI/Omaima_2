-- Setup Admin User for Omaima v2
-- Run this in your Supabase SQL Editor

-- First, let's check if the user already exists
-- If not, you'll need to create them via Supabase Auth UI or use the setup-admin endpoint

-- Update user metadata to set admin role
-- Replace 'your-admin-user-id' with the actual user ID from auth.users table
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"ADMIN"'::jsonb
)
WHERE email = 'admin@omaima.com';

-- Also update user_metadata for consistency
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  raw_user_meta_data,
  '{first_name}',
  '"Admin"'::jsonb
)
WHERE email = 'admin@omaima.com';

UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  raw_user_meta_data,
  '{last_name}',
  '"User"'::jsonb
)
WHERE email = 'admin@omaima.com';

-- Verify the admin user setup
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data->>'first_name' as first_name,
  raw_user_meta_data->>'last_name' as last_name,
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email = 'admin@omaima.com';
