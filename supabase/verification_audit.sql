-- Verification Script for Audit Logs
-- Run this in the Supabase SQL Editor

BEGIN;

-- 1. Create a dummy user for testing
DO $$
DECLARE 
  test_user_id UUID := gen_random_uuid();
  admin_user_id UUID := gen_random_uuid();
BEGIN
  -- Simulate a normal user action
  -- We can't easily simulate strict auth.uid() in a simple script without creating real auth users,
  -- but we can test that the table exists and accepts inserts.
  
  -- Attempt to Insert a log (simulating application logic)
  INSERT INTO audit_logs (item_id, user_id, action, metadata)
  VALUES (
    gen_random_uuid(), -- id
    test_user_id,      -- user_id (needs to match auth.uid() in real scenario)
    'TEST_ACTION',
    '{"test": true}'::jsonb
  );
  
  -- Verify Insert happened (would fail with RLS if not set up right, 
  -- but here we are superuser in SQL editor so we bypass, 
  -- this is just to check syntax and constraint validity)
  RAISE NOTICE 'Insert successful (Syntax check passed).';

  -- Immutability Check (Conceptual):
  -- UPDATE audit_logs SET action = 'HACKED' WHERE action = 'TEST_ACTION';
  -- This should return an error or affect 0 rows if run as the specific role.
  
END $$;

ROLLBACK; -- Don't keep junk data
