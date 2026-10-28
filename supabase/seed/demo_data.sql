-- ============================================================
-- Campus Growth — 3-Day Active Campaign Real-World Seed Data
-- Exactly 18 Registrations matching Dashboard, Promoters & Leaderboard
-- ============================================================

-- Clean up existing demo data if any
DELETE FROM referral_events WHERE is_demo = TRUE;
DELETE FROM registrations   WHERE is_demo = TRUE;
DELETE FROM promoters       WHERE is_demo = TRUE;

-- ── 1. 11 Real Promoters across 5 Channels ────────────────────
INSERT INTO promoters (display_name, category, college_or_club, referral_code, active, is_demo, notes) VALUES
('Arjun Sharma',            'student',             'IIT Hyderabad',                  'STUDENT001', TRUE, TRUE, 'Campus Ambassador - Lead'),
('Priya Nair',              'student',             'NIT Warangal',                   'STUDENT002', TRUE, TRUE, 'Student Rep - ECE'),
('Rahul Verma',             'student',             'BITS Pilani',                    'STUDENT003', TRUE, TRUE, 'Student Ambassador - CS'),
('Sneha Patel',             'student',             'VNR VJIET',                      'STUDENT004', TRUE, TRUE, 'Student Ambassador'),
('CSE Club — CBIT',         'club_convener',       'CBIT Hyderabad',                 'CSECLUB01',  TRUE, TRUE, 'Technical Club Partnership'),
('IEEE Student Chapter — VIT','club_convener',     'VIT Vellore',                    'IEEE001',    TRUE, TRUE, 'IEEE Student Branch Convener'),
('E-Cell MJCET',            'club_convener',       'MJCET Hyderabad',                'ECELL001',   TRUE, TRUE, 'Entrepreneurship Cell'),
('TechWithRiya (YouTube)',  'content_creator',     NULL,                             'CREATOR01',  TRUE, TRUE, 'Tech YouTuber'),
('CodeWithSam (Instagram)', 'content_creator',     NULL,                             'CREATOR02',  TRUE, TRUE, 'Instagram Tech Creator'),
('Hostel Block-A QR',       'campus_hostel',       'IIT Hyderabad Hostel',           'HOSTELQR01', TRUE, TRUE, 'Mess noticeboard poster QR'),
('Dean Academic Email',     'institutional_email', 'IIT Hyderabad',                  'DEANEMAIL01',TRUE, TRUE, 'Department circular distribution');

-- ── 2. Exactly 18 Real-World Student Registrations ─────────────
DO $$
DECLARE
  p_s1 UUID; p_s2 UUID; p_s3 UUID; p_s4 UUID;
  p_c1 UUID; p_c2 UUID; p_c3 UUID;
  p_cr1 UUID; p_cr2 UUID;
  p_h1 UUID; p_d1 UUID;
BEGIN
  SELECT id INTO p_s1  FROM promoters WHERE referral_code = 'STUDENT001';
  SELECT id INTO p_s2  FROM promoters WHERE referral_code = 'STUDENT002';
  SELECT id INTO p_s3  FROM promoters WHERE referral_code = 'STUDENT003';
  SELECT id INTO p_s4  FROM promoters WHERE referral_code = 'STUDENT004';
  SELECT id INTO p_c1  FROM promoters WHERE referral_code = 'CSECLUB01';
  SELECT id INTO p_c2  FROM promoters WHERE referral_code = 'IEEE001';
  SELECT id INTO p_c3  FROM promoters WHERE referral_code = 'ECELL001';
  SELECT id INTO p_cr1 FROM promoters WHERE referral_code = 'CREATOR01';
  SELECT id INTO p_cr2 FROM promoters WHERE referral_code = 'CREATOR02';
  SELECT id INTO p_h1  FROM promoters WHERE referral_code = 'HOSTELQR01';
  SELECT id INTO p_d1  FROM promoters WHERE referral_code = 'DEANEMAIL01';

  -- Day 3 (Today - 8 Registrations)
  INSERT INTO registrations (full_name, email, normalized_email, college, study_year, phone, attributed_promoter_id, attributed_referral_code, attribution_source, registration_status, is_demo, registered_at) VALUES
  ('Aarav Sharma', 'aarav.sharma@iith.ac.in', 'aarav.sharma@iith.ac.in', 'IIT Hyderabad', 'Final Year', '+919876543210', p_s1, 'STUDENT001', 'student', 'confirmed', TRUE, NOW() - INTERVAL '1 hour'),
  ('Ananya Iyer', 'ananya.iyer@vit.ac.in', 'ananya.iyer@vit.ac.in', 'VIT Vellore', 'Final Year', '+919845012345', p_c1, 'CSECLUB01', 'club_convener', 'confirmed', TRUE, NOW() - INTERVAL '2 hours'),
  ('Rohan Deshmukh', 'rohan.d@cbit.ac.in', 'rohan.d@cbit.ac.in', 'CBIT Hyderabad', 'Final Year', '+919701122334', p_cr1, 'CREATOR01', 'content_creator', 'confirmed', TRUE, NOW() - INTERVAL '2 hours 30 mins'),
  ('Sneha Patel', 'sneha.patel@nitw.ac.in', 'sneha.patel@nitw.ac.in', 'NIT Warangal', 'Final Year', '+919618833445', p_s2, 'STUDENT002', 'student', 'confirmed', TRUE, NOW() - INTERVAL '3 hours'),
  ('Vikram Reddy', 'vikram.reddy@vnrvjiet.in', 'vikram.reddy@vnrvjiet.in', 'VNR VJIET Hyderabad', 'Final Year', '+919988776655', p_h1, 'HOSTELQR01', 'campus_hostel', 'confirmed', TRUE, NOW() - INTERVAL '3 hours 45 mins'),
  ('Pooja Nair', 'pooja.nair@bits-pilani.ac.in', 'pooja.nair@bits-pilani.ac.in', 'BITS Pilani Hyderabad', 'Final Year', '+919123456780', p_s1, 'STUDENT001', 'student', 'confirmed', TRUE, NOW() - INTERVAL '4 hours'),
  ('Aditya Verma', 'aditya.v@srmist.edu.in', 'aditya.v@srmist.edu.in', 'SRM University', 'Final Year', '+919501234567', p_d1, 'DEANEMAIL01', 'institutional_email', 'confirmed', TRUE, NOW() - INTERVAL '5 hours'),
  ('Meera Nair', 'meera.nair@mjcet.ac.in', 'meera.nair@mjcet.ac.in', 'MJCET Hyderabad', 'Final Year', '+919440112233', p_c3, 'ECELL001', 'club_convener', 'confirmed', TRUE, NOW() - INTERVAL '6 hours'),

  -- Day 2 (Yesterday - 6 Registrations)
  ('Neha Gupta', 'neha.gupta@cbit.ac.in', 'neha.gupta@cbit.ac.in', 'CBIT Hyderabad', 'Final Year', '+919871122334', p_c1, 'CSECLUB01', 'club_convener', 'confirmed', TRUE, NOW() - INTERVAL '1 day' - INTERVAL '2 hours'),
  ('Sai Teja Varma', 'saiteja.v@jntuh.ac.in', 'saiteja.v@jntuh.ac.in', 'JNTU Hyderabad', 'Final Year', '+919700011222', p_s1, 'STUDENT001', 'student', 'confirmed', TRUE, NOW() - INTERVAL '1 day' - INTERVAL '3 hours'),
  ('Divya Krishnan', 'divya.k@vit.ac.in', 'divya.k@vit.ac.in', 'VIT Vellore', 'Final Year', '+919444123456', p_c2, 'IEEE001', 'club_convener', 'confirmed', TRUE, NOW() - INTERVAL '1 day' - INTERVAL '5 hours'),
  ('Rahul Choudhary', 'rahul.c@nitw.ac.in', 'rahul.c@nitw.ac.in', 'NIT Warangal', 'Final Year', '+919989012345', p_cr1, 'CREATOR01', 'content_creator', 'confirmed', TRUE, NOW() - INTERVAL '1 day' - INTERVAL '6 hours'),
  ('Priya Sharma', 'priya.s@vasavi.ac.in', 'priya.s@vasavi.ac.in', 'Vasavi College of Engg', 'Final Year', '+919848098765', p_s2, 'STUDENT002', 'student', 'confirmed', TRUE, NOW() - INTERVAL '1 day' - INTERVAL '8 hours'),
  ('Ashwin Sundaram', 'ashwin.s@iitm.ac.in', 'ashwin.s@iitm.ac.in', 'IIT Madras', 'Final Year', '+919840123456', p_s3, 'STUDENT003', 'student', 'confirmed', TRUE, NOW() - INTERVAL '1 day' - INTERVAL '11 hours'),

  -- Day 1 (Campaign Launch - 4 Registrations)
  ('Tanvi Deshmukh', 'tanvi.d@iith.ac.in', 'tanvi.d@iith.ac.in', 'IIT Hyderabad', 'Final Year', '+919822123456', p_s4, 'STUDENT004', 'student', 'confirmed', TRUE, NOW() - INTERVAL '2 days' - INTERVAL '2 hours'),
  ('Varun Kapoor', 'varun.k@cbit.ac.in', 'varun.k@cbit.ac.in', 'CBIT Hyderabad', 'Final Year', '+919811122334', p_c2, 'IEEE001', 'club_convener', 'confirmed', TRUE, NOW() - INTERVAL '2 days' - INTERVAL '4 hours'),
  ('Shreya Bose', 'shreya.bose@bits-hyderabad.ac.in', 'shreya.bose@bits-hyderabad.ac.in', 'BITS Pilani Hyderabad', 'Final Year', '+919830112233', p_cr2, 'CREATOR02', 'content_creator', 'confirmed', TRUE, NOW() - INTERVAL '2 days' - INTERVAL '6 hours'),
  ('Karthik Subramanian', 'karthik.sub@iitb.ac.in', 'karthik.sub@iitb.ac.in', 'IIT Bombay', 'Final Year', '+919820011223', NULL, NULL, 'direct', 'confirmed', TRUE, NOW() - INTERVAL '2 days' - INTERVAL '10 hours');

  -- ── 3. Realistic Click Events (46 Total) ───────────────────────
  INSERT INTO referral_events (referral_code, promoter_id, event_type, session_id, is_demo, created_at)
  SELECT 'STUDENT001', p_s1, 'click', 'sess-' || gen_random_uuid(), TRUE, NOW() - (s || ' hours')::INTERVAL FROM generate_series(1, 7) s;

  INSERT INTO referral_events (referral_code, promoter_id, event_type, session_id, is_demo, created_at)
  SELECT 'STUDENT002', p_s2, 'click', 'sess-' || gen_random_uuid(), TRUE, NOW() - (s || ' hours')::INTERVAL FROM generate_series(1, 5) s;

  INSERT INTO referral_events (referral_code, promoter_id, event_type, session_id, is_demo, created_at)
  SELECT 'STUDENT003', p_s3, 'click', 'sess-' || gen_random_uuid(), TRUE, NOW() - (s || ' hours')::INTERVAL FROM generate_series(1, 3) s;

  INSERT INTO referral_events (referral_code, promoter_id, event_type, session_id, is_demo, created_at)
  SELECT 'STUDENT004', p_s4, 'click', 'sess-' || gen_random_uuid(), TRUE, NOW() - (s || ' hours')::INTERVAL FROM generate_series(1, 2) s;

  INSERT INTO referral_events (referral_code, promoter_id, event_type, session_id, is_demo, created_at)
  SELECT 'CSECLUB01', p_c1, 'click', 'sess-' || gen_random_uuid(), TRUE, NOW() - (s || ' hours')::INTERVAL FROM generate_series(1, 5) s;

  INSERT INTO referral_events (referral_code, promoter_id, event_type, session_id, is_demo, created_at)
  SELECT 'IEEE001', p_c2, 'click', 'sess-' || gen_random_uuid(), TRUE, NOW() - (s || ' hours')::INTERVAL FROM generate_series(1, 4) s;

  INSERT INTO referral_events (referral_code, promoter_id, event_type, session_id, is_demo, created_at)
  SELECT 'ECELL001', p_c3, 'click', 'sess-' || gen_random_uuid(), TRUE, NOW() - (s || ' hours')::INTERVAL FROM generate_series(1, 3) s;

  INSERT INTO referral_events (referral_code, promoter_id, event_type, session_id, is_demo, created_at)
  SELECT 'CREATOR01', p_cr1, 'click', 'sess-' || gen_random_uuid(), TRUE, NOW() - (s || ' hours')::INTERVAL FROM generate_series(1, 8) s;

  INSERT INTO referral_events (referral_code, promoter_id, event_type, session_id, is_demo, created_at)
  SELECT 'CREATOR02', p_cr2, 'click', 'sess-' || gen_random_uuid(), TRUE, NOW() - (s || ' hours')::INTERVAL FROM generate_series(1, 4) s;

  INSERT INTO referral_events (referral_code, promoter_id, event_type, session_id, is_demo, created_at)
  SELECT 'HOSTELQR01', p_h1, 'click', 'sess-' || gen_random_uuid(), TRUE, NOW() - (s || ' hours')::INTERVAL FROM generate_series(1, 3) s;

  INSERT INTO referral_events (referral_code, promoter_id, event_type, session_id, is_demo, created_at)
  SELECT 'DEANEMAIL01', p_d1, 'click', 'sess-' || gen_random_uuid(), TRUE, NOW() - (s || ' hours')::INTERVAL FROM generate_series(1, 2) s;
END $$;
