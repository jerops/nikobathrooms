-- Migration: Create user deletion webhook trigger
-- This trigger will automatically call the delete-webflow-user edge function
-- when a user is deleted from Supabase Auth

-- Create a function to handle user deletions
CREATE OR REPLACE FUNCTION handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the edge function to delete from Webflow CMS
  -- Using pg_net extension to make HTTP requests
  SELECT net.http_post(
    url := 'https://bzjoxjqfpmjhbfijthpp.supabase.co/functions/v1/delete-webflow-user',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_key', true)
    ),
    body := jsonb_build_object(
      'user_id', OLD.id::text,
      'email', OLD.email
    )::text
  );
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users table
DROP TRIGGER IF EXISTS on_user_deleted ON auth.users;
CREATE TRIGGER on_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_user_deletion();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA net TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA net TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA net TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA net TO postgres, anon, authenticated, service_role;

-- Note: You may need to enable the pg_net extension first:
-- SELECT pg_available_extensions WHERE name = 'pg_net';
-- CREATE EXTENSION IF NOT EXISTS pg_net;