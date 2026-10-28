// ============================================================
// Validation utilities — used by both client and tests
// ============================================================

export const VALID_STUDY_YEARS = [
  'Final Year',
  '4th Year',
  'B.Tech 4th Year',
  'BE 4th Year',
];

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

export function normalizeEmail(email) {
  return (email || '').toLowerCase().trim();
}

export function validateEmail(email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return 'Email address is required.';
  if (!EMAIL_REGEX.test(normalized)) return 'Please enter a valid email address.';
  return null;
}

export function validateFullName(name) {
  const trimmed = (name || '').trim();
  if (!trimmed) return 'Full name is required.';
  if (trimmed.length < 2) return 'Name must be at least 2 characters.';
  if (trimmed.length > 100) return 'Name must be under 100 characters.';
  if (!/^[a-zA-Z\s'.,-]+$/.test(trimmed)) return 'Name contains invalid characters.';
  return null;
}

export function validateCollege(college) {
  const trimmed = (college || '').trim();
  if (!trimmed) return 'College or university name is required.';
  if (trimmed.length < 2) return 'Please enter a valid college name.';
  if (trimmed.length > 150) return 'College name is too long.';
  return null;
}

export function validateStudyYear(year) {
  if (!year) return 'Please select your year of study.';
  if (!VALID_STUDY_YEARS.includes(year)) {
    return 'This workshop is for final-year engineering students only.';
  }
  return null;
}

export function validatePhone(phone) {
  if (!phone || phone.trim() === '') return null; // optional
  const digits = phone.replace(/[\s\-+()]/g, '');
  if (!/^\d{10,15}$/.test(digits)) return 'Please enter a valid phone number (10–15 digits).';
  return null;
}

export function validateRegistrationForm(values) {
  const errors = {};
  const nameErr = validateFullName(values.fullName);
  if (nameErr) errors.fullName = nameErr;

  const emailErr = validateEmail(values.email);
  if (emailErr) errors.email = emailErr;

  const collegeErr = validateCollege(values.college);
  if (collegeErr) errors.college = collegeErr;

  const yearErr = validateStudyYear(values.studyYear);
  if (yearErr) errors.studyYear = yearErr;

  const phoneErr = validatePhone(values.phone);
  if (phoneErr) errors.phone = phoneErr;

  return errors;
}

export function isFormValid(values) {
  const errors = validateRegistrationForm(values);
  return Object.keys(errors).length === 0;
}
