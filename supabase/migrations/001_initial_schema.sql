-- ============================================================
-- Campus Growth — NxtWave AI Workshop Registration Platform
-- Migration 001: Initial Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE promoter_category AS ENUM (
  'student',
  'club_convener',
  'content_creator',
  'campus_hostel',
  'institutional_email'
);

CREATE TYPE campaign_status AS ENUM (
  'draft',
  'active',
  'closed',
  'paused'
);

CREATE TYPE registration_status AS ENUM (
  'confirmed',
  'duplicate',
  'invalid',
  'demo'
);

CREATE TYPE event_type AS ENUM (
  'click',
  'registration'
);

-- ============================================================
-- TABLE: campaign_settings
-- Single-row configuration table
-- ============================================================

CREATE TABLE campaign_settings (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_name          TEXT NOT NULL DEFAULT 'Build Your First AI Project in 60 Minutes',
  target_registrations   INTEGER NOT NULL DEFAULT 500,
  campaign_start         TIMESTAMPTZ,
  campaign_end           TIMESTAMPTZ,
  status                 campaign_status NOT NULL DEFAULT 'active',
  workshop_format        TEXT NOT NULL DEFAULT 'Online (link shared before session)',
  workshop_duration      TEXT NOT NULL DEFAULT '60 minutes',
  contact_email          TEXT NOT NULL DEFAULT 'campaign@example.com',
  is_demo_mode           BOOLEAN NOT NULL DEFAULT FALSE,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enforce single-row
CREATE UNIQUE INDEX campaign_settings_singleton ON campaign_settings ((TRUE));

-- ============================================================
-- TABLE: promoters
-- ============================================================

CREATE TABLE promoters (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  display_name     TEXT NOT NULL,
  category         promoter_category NOT NULL,
  college_or_club  TEXT,
  contact_email    TEXT,
  referral_code    TEXT NOT NULL UNIQUE,
  active           BOOLEAN NOT NULL DEFAULT TRUE,
  is_demo          BOOLEAN NOT NULL DEFAULT FALSE,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_promoters_referral_code ON promoters (referral_code);
CREATE INDEX idx_promoters_category      ON promoters (category);
CREATE INDEX idx_promoters_active        ON promoters (active);

-- ============================================================
-- TABLE: registrations
-- ============================================================

CREATE TABLE registrations (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name               TEXT NOT NULL,
  email                   TEXT NOT NULL,
  normalized_email        TEXT NOT NULL UNIQUE,
  college                 TEXT NOT NULL,
  study_year              TEXT NOT NULL,
  phone                   TEXT,
  attributed_promoter_id  UUID REFERENCES promoters(id) ON DELETE SET NULL,
  attributed_referral_code TEXT,
  attribution_source      TEXT NOT NULL DEFAULT 'direct',
  registration_status     registration_status NOT NULL DEFAULT 'confirmed',
  is_demo                 BOOLEAN NOT NULL DEFAULT FALSE,
  ip_hash                 TEXT,    -- hashed for rate-limiting, not stored plain
  registered_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_registrations_normalized_email  ON registrations (normalized_email);
CREATE INDEX idx_registrations_promoter_id       ON registrations (attributed_promoter_id);
CREATE INDEX idx_registrations_referral_code     ON registrations (attributed_referral_code);
CREATE INDEX idx_registrations_registered_at     ON registrations (registered_at);
CREATE INDEX idx_registrations_status            ON registrations (registration_status);

-- ============================================================
-- TABLE: referral_events
-- ============================================================

CREATE TABLE referral_events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_code   TEXT NOT NULL,
  promoter_id     UUID REFERENCES promoters(id) ON DELETE SET NULL,
  event_type      event_type NOT NULL,
  session_id      TEXT,        -- anonymized browser session for dedup
  ip_hash         TEXT,
  is_demo         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_referral_events_code       ON referral_events (referral_code);
CREATE INDEX idx_referral_events_type       ON referral_events (event_type);
CREATE INDEX idx_referral_events_created_at ON referral_events (created_at);

-- ============================================================
-- TABLE: admin_audit_log
-- ============================================================

CREATE TABLE admin_audit_log (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id    UUID,         -- auth.uid() of the acting admin
  admin_email      TEXT,
  action           TEXT NOT NULL,
  affected_table   TEXT,
  affected_id      UUID,
  change_metadata  JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_admin_user  ON admin_audit_log (admin_user_id);
CREATE INDEX idx_audit_created_at  ON admin_audit_log (created_at);

-- ============================================================
-- FUNCTION: normalize_email
-- Lowercases and trims email for deduplication
-- ============================================================

CREATE OR REPLACE FUNCTION normalize_email(email_input TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(TRIM(email_input));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================
-- FUNCTION: generate_referral_code
-- Creates a unique alphanumeric code
-- ============================================================

CREATE OR REPLACE FUNCTION generate_referral_code(prefix TEXT DEFAULT '')
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  suffix TEXT;
BEGIN
  LOOP
    suffix := UPPER(SUBSTRING(encode(gen_random_bytes(4), 'hex') FROM 1 FOR 6));
    IF prefix = '' THEN
      code := suffix;
    ELSE
      code := UPPER(prefix) || suffix;
    END IF;
    -- Check uniqueness
    EXIT WHEN NOT EXISTS (SELECT 1 FROM promoters WHERE referral_code = code);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNCTION: register_student (secure RPC, callable by anon)
-- Performs: validation → dedup → attribution → insert
-- ============================================================

CREATE OR REPLACE FUNCTION register_student(
  p_full_name      TEXT,
  p_email          TEXT,
  p_college        TEXT,
  p_study_year     TEXT,
  p_phone          TEXT DEFAULT NULL,
  p_referral_code  TEXT DEFAULT NULL,
  p_session_id     TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_normalized_email   TEXT;
  v_promoter           promoters%ROWTYPE;
  v_registration_id    UUID;
  v_attribution_source TEXT := 'direct';
  v_promoter_id        UUID := NULL;
  v_campaign           campaign_settings%ROWTYPE;
BEGIN
  -- Fetch campaign settings
  SELECT * INTO v_campaign FROM campaign_settings LIMIT 1;

  -- Block registrations if campaign is closed
  IF v_campaign.status = 'closed' THEN
    RETURN jsonb_build_object('success', false, 'error', 'campaign_closed',
      'message', 'The campaign has ended. Registrations are no longer accepted.');
  END IF;

  -- Normalize email
  v_normalized_email := normalize_email(p_email);

  -- Validate email format
  IF v_normalized_email !~ '^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$' THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_email',
      'message', 'Please provide a valid email address.');
  END IF;

  -- Validate study year
  IF p_study_year NOT IN ('Final Year', '4th Year', 'B.Tech 4th Year', 'BE 4th Year') THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_year',
      'message', 'This workshop is for final-year engineering students only.');
  END IF;

  -- Check duplicate email
  IF EXISTS (SELECT 1 FROM registrations WHERE normalized_email = v_normalized_email AND registration_status != 'duplicate') THEN
    RETURN jsonb_build_object('success', false, 'error', 'duplicate_email',
      'message', 'This email address is already registered. Each student may register only once.');
  END IF;

  -- Resolve referral code (first-touch, must be active)
  IF p_referral_code IS NOT NULL AND p_referral_code != '' THEN
    SELECT * INTO v_promoter
    FROM promoters
    WHERE referral_code = UPPER(TRIM(p_referral_code))
      AND active = TRUE
    LIMIT 1;

    IF FOUND THEN
      v_promoter_id        := v_promoter.id;
      v_attribution_source := v_promoter.category::TEXT;

      -- Log referral click → registration event
      INSERT INTO referral_events (referral_code, promoter_id, event_type, session_id)
      VALUES (v_promoter.referral_code, v_promoter.id, 'registration', p_session_id);
    ELSE
      -- Invalid code → treat as direct
      v_attribution_source := 'direct';
    END IF;
  END IF;

  -- Insert registration
  INSERT INTO registrations (
    full_name, email, normalized_email, college, study_year, phone,
    attributed_promoter_id, attributed_referral_code, attribution_source,
    registration_status
  )
  VALUES (
    TRIM(p_full_name), TRIM(p_email), v_normalized_email, TRIM(p_college),
    p_study_year, p_phone,
    v_promoter_id,
    CASE WHEN v_promoter_id IS NOT NULL THEN v_promoter.referral_code ELSE NULL END,
    v_attribution_source,
    'confirmed'
  )
  RETURNING id INTO v_registration_id;

  RETURN jsonb_build_object(
    'success', true,
    'registration_id', v_registration_id,
    'attributed_to', CASE WHEN v_promoter_id IS NOT NULL THEN v_promoter.display_name ELSE NULL END,
    'attribution_source', v_attribution_source
  );

EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('success', false, 'error', 'duplicate_email',
      'message', 'This email address is already registered.');
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', 'server_error',
      'message', 'A server error occurred. Please try again.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: log_referral_click (callable by anon)
-- ============================================================

CREATE OR REPLACE FUNCTION log_referral_click(
  p_referral_code TEXT,
  p_session_id    TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_promoter promoters%ROWTYPE;
BEGIN
  SELECT * INTO v_promoter
  FROM promoters
  WHERE referral_code = UPPER(TRIM(p_referral_code)) AND active = TRUE
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false);
  END IF;

  -- Deduplicate: one click per session per code
  IF NOT EXISTS (
    SELECT 1 FROM referral_events
    WHERE referral_code = v_promoter.referral_code
      AND event_type = 'click'
      AND session_id = p_session_id
      AND created_at > NOW() - INTERVAL '1 hour'
  ) THEN
    INSERT INTO referral_events (referral_code, promoter_id, event_type, session_id)
    VALUES (v_promoter.referral_code, v_promoter.id, 'click', p_session_id);
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'promoter_name', v_promoter.display_name,
    'category', v_promoter.category
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE promoters          ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_events    ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_settings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log    ENABLE ROW LEVEL SECURITY;

-- Admins: full access (uses Supabase Auth + admin_emails check)
-- We use a helper function to check admin status

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROMOTERS: admins can do anything; anon can read active promoters (for referral validation only via RPC)
CREATE POLICY "admin_all_promoters" ON promoters
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "public_read_active_promoters" ON promoters
  FOR SELECT TO anon
  USING (active = TRUE);

-- REGISTRATIONS: admins see all; anon cannot read any
CREATE POLICY "admin_all_registrations" ON registrations
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- REFERRAL_EVENTS: admins see all; anon can insert via RPC only
CREATE POLICY "admin_all_referral_events" ON referral_events
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- CAMPAIGN_SETTINGS: admins can update; anon can read non-sensitive fields
CREATE POLICY "admin_all_campaign_settings" ON campaign_settings
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "public_read_campaign_settings" ON campaign_settings
  FOR SELECT TO anon USING (TRUE);

-- ADMIN AUDIT LOG: admins read only
CREATE POLICY "admin_read_audit" ON admin_audit_log
  FOR SELECT TO authenticated USING (is_admin());

CREATE POLICY "admin_insert_audit" ON admin_audit_log
  FOR INSERT TO authenticated WITH CHECK (is_admin());

-- Grant RPC execution to anon
GRANT EXECUTE ON FUNCTION register_student TO anon;
GRANT EXECUTE ON FUNCTION log_referral_click TO anon;
GRANT EXECUTE ON FUNCTION normalize_email TO anon;

-- ============================================================
-- INITIAL CAMPAIGN SETTINGS SEED
-- ============================================================

INSERT INTO campaign_settings (
  campaign_name, target_registrations, status,
  workshop_format, workshop_duration, contact_email
) VALUES (
  'Build Your First AI Project in 60 Minutes',
  500, 'active',
  'Online (link to be shared before session)',
  '60 minutes',
  'campaign@example.com'
);
