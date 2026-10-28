import { describe, it, expect } from 'vitest';
import {
  flattenRegistrationForExport,
  flattenPromoterForExport,
} from '../../src/lib/export';
import { buildReferralUrl } from '../../src/lib/referral';

describe('Admin Data Export & Public Privacy', () => {
  it('formats registration records properly for CSV export', () => {
    const rawReg = {
      id: 'reg-uuid-123',
      full_name: 'Priya Sharma',
      email: 'priya@example.com',
      college: 'IIT Hyderabad',
      study_year: 'Final Year',
      phone: '+919876543210',
      attributed_referral_code: 'STUDENT001',
      attribution_source: 'student',
      registration_status: 'confirmed',
      is_demo: false,
      registered_at: '2026-10-24T10:00:00Z',
      ip_hash: 'secret-hash-not-to-be-exposed', // internal field
    };

    const exported = flattenRegistrationForExport(rawReg);

    expect(exported.ID).toBe('reg-uuid-123');
    expect(exported['Full Name']).toBe('Priya Sharma');
    expect(exported.Email).toBe('priya@example.com');
    expect(exported['Referral Code']).toBe('STUDENT001');
    expect(exported['Attribution Source']).toBe('student');
    expect(exported['Is Demo']).toBe('No');
    // Ensure internal hash/sensitive fields are never included
    expect(exported.ip_hash).toBeUndefined();
  });

  it('formats promoter records and conversion rates accurately', () => {
    const promoter = {
      id: 'prom-1',
      display_name: 'CSE Club',
      category: 'club_convener',
      college_or_club: 'CBIT',
      referral_code: 'CSECLUB01',
      active: true,
      is_demo: true,
      created_at: '2026-10-22T08:00:00Z',
    };

    const stats = { clicks: 50, registrations: 10 };
    const exported = flattenPromoterForExport(promoter, stats);

    expect(exported['Display Name']).toBe('CSE Club');
    expect(exported.Category).toBe('club_convener');
    expect(exported.Clicks).toBe(50);
    expect(exported.Registrations).toBe(10);
    expect(exported['Conversion Rate']).toBe('20.0%');
    expect(exported['Is Demo']).toBe('YES (demo data)');
  });

  it('handles zero clicks safely without dividing by zero', () => {
    const promoter = {
      id: 'prom-2',
      display_name: 'New Host',
      category: 'campus_hostel',
      referral_code: 'HOSTEL01',
      active: true,
      created_at: '2026-10-24T08:00:00Z',
    };

    const stats = { clicks: 0, registrations: 0 };
    const exported = flattenPromoterForExport(promoter, stats);
    expect(exported['Conversion Rate']).toBe('0%');
  });
});

describe('QR Code & Referral Link Generation', () => {
  it('generates fully formed absolute URLs containing ref query', () => {
    const url = buildReferralUrl('CSECLUB01');
    expect(url).toContain('/register?ref=CSECLUB01');
  });

  it('encodes special characters in referral codes properly', () => {
    const url = buildReferralUrl('CAMPUS 2026');
    expect(url).toContain('CAMPUS%202026');
  });
});

describe('Admin Authorization Rules', () => {
  function checkIsAdmin(user) {
    return user?.user_metadata?.role === 'admin' || user?.is_demo_admin === true;
  }

  it('grants admin access when role is admin', () => {
    expect(checkIsAdmin({ user_metadata: { role: 'admin' } })).toBe(true);
  });

  it('grants admin access for simulated demo admin session', () => {
    expect(checkIsAdmin({ is_demo_admin: true })).toBe(true);
  });

  it('denies admin access for regular authenticated user', () => {
    expect(checkIsAdmin({ user_metadata: { role: 'student' } })).toBe(false);
    expect(checkIsAdmin({ email: 'student@example.com' })).toBe(false);
    expect(checkIsAdmin(null)).toBe(false);
  });
});
