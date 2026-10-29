import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store = {};
  return {
    getItem: vi.fn(k => store[k] ?? null),
    setItem: vi.fn((k, v) => { store[k] = String(v); }),
    removeItem: vi.fn(k => { delete store[k]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(global, 'sessionStorage', { value: mockSessionStorage });

// Mock window.location
Object.defineProperty(global, 'window', {
  value: { location: { search: '' } },
  writable: true,
});

import {
  captureReferralCode,
  getReferralCode,
  clearReferralCode,
  buildReferralUrl,
  getSessionId,
  generateStudentReferralCode,
} from '../../src/lib/referral';

describe('Referral code capture', () => {
  beforeEach(() => {
    mockSessionStorage.clear();
    vi.clearAllMocks();
  });

  it('returns null when no ref param and no stored code', () => {
    global.window.location.search = '';
    const code = captureReferralCode();
    expect(code).toBeNull();
  });

  it('captures a referral code from URL params', () => {
    global.window.location.search = '?ref=STUDENT001';
    // Force URLSearchParams to work
    global.URLSearchParams = class {
      constructor(s) { this.s = s; }
      get(k) {
        const m = this.s.match(new RegExp('[?&]' + k + '=([^&]+)'));
        return m ? m[1] : null;
      }
    };

    mockSessionStorage.getItem.mockReturnValueOnce(null);
    mockSessionStorage.setItem.mockImplementationOnce((k, v) => {});
    mockSessionStorage.getItem.mockReturnValueOnce('STUDENT001');

    const code = captureReferralCode();
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      'cg_referral_code', 'STUDENT001'
    );
  });

  it('preserves first-touch attribution — does not overwrite existing code', () => {
    global.window.location.search = '?ref=SECOND_CODE';
    mockSessionStorage.getItem.mockReturnValue('FIRST_CODE');

    const code = captureReferralCode();
    // setItem should NOT be called since a code already exists
    expect(mockSessionStorage.setItem).not.toHaveBeenCalled();
  });

  it('getReferralCode returns stored code', () => {
    mockSessionStorage.getItem.mockReturnValue('STORED_CODE');
    expect(getReferralCode()).toBe('STORED_CODE');
  });

  it('clearReferralCode removes the stored code', () => {
    clearReferralCode();
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('cg_referral_code');
  });
});

describe('buildReferralUrl', () => {
  it('builds a correct referral URL', () => {
    const url = buildReferralUrl('STUDENT001');
    expect(url).toContain('/register?ref=STUDENT001');
  });

  it('includes the referral code in the URL', () => {
    const url = buildReferralUrl('CSECLUB01');
    expect(url).toContain('ref=CSECLUB01');
  });
});

describe('getSessionId', () => {
  it('returns a non-empty session ID', () => {
    mockSessionStorage.getItem.mockReturnValueOnce(null);
    const id = getSessionId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });
});

describe('generateStudentReferralCode', () => {
  it('generates a clean uppercase referral code from name and seed', () => {
    const code = generateStudentReferralCode('Arjun Sharma', 'DEMO-8A2F');
    expect(code).toBe('ARJUN8A2F');
  });

  it('handles empty names gracefully with default prefix', () => {
    const code = generateStudentReferralCode('', '1234');
    expect(code.startsWith('STUDENT')).toBe(true);
    expect(code).toContain('1234');
  });

  it('formats code cleanly for buildReferralUrl', () => {
    const code = generateStudentReferralCode('Sneha Patel', 'XYZ9');
    const url = buildReferralUrl(code);
    expect(url).toContain(`/register?ref=${code}`);
  });
});
