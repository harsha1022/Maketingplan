import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validateFullName,
  validateCollege,
  validateStudyYear,
  validatePhone,
  validateRegistrationForm,
  normalizeEmail,
  VALID_STUDY_YEARS,
} from '../../src/lib/validation';

// ── Email validation ───────────────────────────────────────────
describe('validateEmail', () => {
  it('accepts valid emails', () => {
    expect(validateEmail('priya@example.com')).toBeNull();
    expect(validateEmail('student.99@iit.ac.in')).toBeNull();
    expect(validateEmail('USER@DOMAIN.COM')).toBeNull();
  });

  it('rejects empty email', () => {
    expect(validateEmail('')).toBeTruthy();
    expect(validateEmail('  ')).toBeTruthy();
  });

  it('rejects invalid email formats', () => {
    expect(validateEmail('notanemail')).toBeTruthy();
    expect(validateEmail('missing@')).toBeTruthy();
    expect(validateEmail('@domain.com')).toBeTruthy();
    expect(validateEmail('double@@domain.com')).toBeTruthy();
  });
});

// ── Email normalization ────────────────────────────────────────
describe('normalizeEmail', () => {
  it('lowercases and trims', () => {
    expect(normalizeEmail('  PRIYA@EXAMPLE.COM  ')).toBe('priya@example.com');
    expect(normalizeEmail('User@Domain.Com')).toBe('user@domain.com');
  });

  it('handles null/undefined', () => {
    expect(normalizeEmail(null)).toBe('');
    expect(normalizeEmail(undefined)).toBe('');
  });
});

// ── Name validation ────────────────────────────────────────────
describe('validateFullName', () => {
  it('accepts valid names', () => {
    expect(validateFullName('Priya Sharma')).toBeNull();
    expect(validateFullName("O'Connor")).toBeNull();
    expect(validateFullName('Dr. Ravi')).toBeNull();
  });

  it('rejects empty name', () => {
    expect(validateFullName('')).toBeTruthy();
    expect(validateFullName('  ')).toBeTruthy();
  });

  it('rejects single-char name', () => {
    expect(validateFullName('A')).toBeTruthy();
  });

  it('rejects name with invalid characters', () => {
    expect(validateFullName('Priya123')).toBeTruthy();
    expect(validateFullName('priya@example')).toBeTruthy();
  });
});

// ── Study year validation ──────────────────────────────────────
describe('validateStudyYear', () => {
  it('accepts valid final-year values', () => {
    VALID_STUDY_YEARS.forEach(year => {
      expect(validateStudyYear(year)).toBeNull();
    });
  });

  it('rejects non-final-year values', () => {
    expect(validateStudyYear('3rd Year')).toBeTruthy();
    expect(validateStudyYear('2nd Year')).toBeTruthy();
    expect(validateStudyYear('1st Year')).toBeTruthy();
    expect(validateStudyYear('')).toBeTruthy();
    expect(validateStudyYear(null)).toBeTruthy();
  });
});

// ── Phone validation ───────────────────────────────────────────
describe('validatePhone', () => {
  it('accepts valid phone numbers', () => {
    expect(validatePhone('9876543210')).toBeNull();
    expect(validatePhone('+91 98765 43210')).toBeNull();
    expect(validatePhone('')).toBeNull();         // optional
    expect(validatePhone(null)).toBeNull();       // optional
  });

  it('rejects invalid phone numbers', () => {
    expect(validatePhone('123')).toBeTruthy();    // too short
    expect(validatePhone('abc1234567')).toBeTruthy();
  });
});

// ── Full form validation ───────────────────────────────────────
describe('validateRegistrationForm', () => {
  const validForm = {
    fullName: 'Priya Sharma',
    email: 'priya@example.com',
    college: 'IIT Hyderabad',
    studyYear: 'Final Year',
    phone: '',
  };

  it('returns no errors for valid form', () => {
    const errors = validateRegistrationForm(validForm);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('returns errors for all invalid fields', () => {
    const errors = validateRegistrationForm({
      fullName: '',
      email: 'bad-email',
      college: '',
      studyYear: '2nd Year',
      phone: '123',
    });
    expect(errors.fullName).toBeTruthy();
    expect(errors.email).toBeTruthy();
    expect(errors.college).toBeTruthy();
    expect(errors.studyYear).toBeTruthy();
    expect(errors.phone).toBeTruthy();
  });

  it('does not require phone', () => {
    const errors = validateRegistrationForm({ ...validForm, phone: '' });
    expect(errors.phone).toBeUndefined();
  });
});
