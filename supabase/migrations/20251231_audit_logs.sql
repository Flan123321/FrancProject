-- 7. Audit Logs Table (Immutable Audit Trail)
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL, -- Who did it
  action TEXT NOT NULL, -- What they did (e.g., 'DOWNLOAD_REPORT')
  resource_id TEXT, -- ID of the affected resource (optional)
  metadata JSONB -- Extra details (IP, User Agent, etc.)
);

-- 8. Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies for Audit Logs (The "Bitácora Inborrable")

-- A. INSERT: Authenticated users can write logs (e.g. "I downloaded X")
CREATE POLICY "Insert audit logs" ON audit_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- B. SELECT: Only Admins can view the full audit trail
CREATE POLICY "View audit logs" ON audit_logs FOR SELECT
USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE
);

-- C. NO UPDATE/DELETE Policies defined -> Implies DENY ALL by default for standard users.
-- This ensures that once a log is written, it cannot be changed or removed via the API.
