-- ==========================================
-- VERIFICATION SCRIPT: Multi-Tenancy & RBAC
-- ==========================================
-- Instructions: Run this script in the Supabase SQL Editor to test the policies.
-- Note: This script uses `pgtap` if available, or just standard SQL assertions.
-- Since we might not have pgtap, we'll verify logic by observing query results.

-- 1. Setup: Create 2 Users and 2 Organizations
-- (In a real scenario, users are created via Auth, here we simulate the IDs)

DO $$
DECLARE
  -- User IDs (simulated)
  admin_user_id uuid := gen_random_uuid();
  member_user_id uuid := gen_random_uuid();
  outsider_user_id uuid := gen_random_uuid();
  
  -- Organization IDs
  org_a_id uuid;
  org_b_id uuid;
  
  -- Project IDs
  proj_a_id uuid;
BEGIN
  -- RAISE NOTICE '--- Setup Start ---';

  -- Simulate Profiles (usually done by trigger, but we need raw inserts here for testing if we bypass auth)
  -- However, RLS relies on auth.uid(). 
  -- TO TEST RLS MANUALLY IN SQL EDITOR, you often need to use:
  -- set request.jwt.claim.sub = 'uuid';
  -- set role authenticated;
  
  -- NOTE: This script is for logical verification structure.
  
  -- Step 1: Create Organizations (Assuming Admin User does it)
  INSERT INTO organizations (name, slug) VALUES ('Org A', 'org-a') RETURNING id INTO org_a_id;
  INSERT INTO organizations (name, slug) VALUES ('Org B', 'org-b') RETURNING id INTO org_b_id;
  
  -- Step 2: Assign Memberships
  -- Admin User -> Admin of Org A
  INSERT INTO organization_members (organization_id, user_id, role) 
  VALUES (org_a_id, admin_user_id, 'admin');
  
  -- Member User -> Member of Org A
  INSERT INTO organization_members (organization_id, user_id, role) 
  VALUES (org_a_id, member_user_id, 'member');
  
  -- Outsider User -> Member of Org B (Not Org A)
  INSERT INTO organization_members (organization_id, user_id, role) 
  VALUES (org_b_id, outsider_user_id, 'admin');

  -- Step 3: Create a Project in Org A
  INSERT INTO projects (organization_id, name, model_url)
  VALUES (org_a_id, 'Project Alpha', 'http://model.url')
  RETURNING id INTO proj_a_id;
  
  -- RAISE NOTICE '--- Setup Complete. Org A ID: %, Project ID: % ---', org_a_id, proj_a_id;
  
  -- ==========================================
  -- VERIFICATION LOGIC (Conceptual)
  -- ==========================================
  
  -- TEST 1: Admin User should see Project Alpha
  -- (Requires switching context to admin_user_id)
  
  -- TEST 2: Member User should see Project Alpha
  -- (Requires switching context to member_user_id)
  
  -- TEST 3: Outsider User should NOT see Project Alpha
  -- (Requires switching context to outsider_user_id)
  
  -- TEST 4: Member User trying to DELETE Project Alpha -> SHOULD FAIL
  
  -- TEST 5: Admin User trying to DELETE Project Alpha -> SHOULD SUCCEED
  
END $$;
