-- ============================================================
-- Migration 00011: Rate limits table + Audit logging
-- ============================================================

-- ── Rate limits (persistent across serverless cold starts) ───
CREATE TABLE IF NOT EXISTS rate_limits (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key         text NOT NULL,
  count       integer NOT NULL DEFAULT 1,
  reset_at    timestamptz NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_rate_limits_key ON rate_limits (key);
CREATE INDEX idx_rate_limits_reset ON rate_limits (reset_at);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Only the service role (admin client) accesses this table
CREATE POLICY "Service role full access on rate_limits"
  ON rate_limits FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── Audit log for admin actions ──────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid REFERENCES tenants(id) ON DELETE CASCADE,
  user_id     uuid,                -- auth.uid() at time of action
  action      text NOT NULL,       -- 'INSERT', 'UPDATE', 'DELETE'
  table_name  text NOT NULL,       -- source table
  record_id   uuid,                -- primary key of affected row
  old_data    jsonb,               -- previous values (UPDATE/DELETE)
  new_data    jsonb,               -- new values (INSERT/UPDATE)
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_tenant ON audit_logs (tenant_id);
CREATE INDEX idx_audit_logs_table ON audit_logs (table_name);
CREATE INDEX idx_audit_logs_created ON audit_logs (created_at DESC);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can read audit logs for their tenant; super admins can read all
CREATE POLICY "Admins read own tenant audit logs"
  ON audit_logs FOR SELECT
  USING (
    is_platform_super_admin()
    OR is_admin_of_tenant(tenant_id)
  );

-- Insert via trigger function (SECURITY DEFINER)
CREATE POLICY "Service role insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- ── Generic audit trigger function ───────────────────────────
CREATE OR REPLACE FUNCTION audit_trigger_fn()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _tenant_id uuid;
  _record_id uuid;
BEGIN
  -- Extract tenant_id from the row (most tables have it)
  IF TG_OP = 'DELETE' THEN
    _tenant_id := OLD.tenant_id;
    _record_id := OLD.id;
  ELSE
    _tenant_id := NEW.tenant_id;
    _record_id := NEW.id;
  END IF;

  INSERT INTO audit_logs (tenant_id, user_id, action, table_name, record_id, old_data, new_data)
  VALUES (
    _tenant_id,
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    _record_id,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- ── Attach audit triggers to key tables ──────────────────────
CREATE TRIGGER audit_trips
  AFTER INSERT OR UPDATE OR DELETE ON trips
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE TRIGGER audit_pages
  AFTER INSERT OR UPDATE OR DELETE ON pages
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE TRIGGER audit_inquiries
  AFTER UPDATE OR DELETE ON inquiries
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE TRIGGER audit_site_config
  AFTER UPDATE ON site_config
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();
