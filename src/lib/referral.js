// ============================================================
// Referral utilities
// ============================================================

const SESSION_KEY = 'cg_referral_code';
const SESSION_ID_KEY = 'cg_session_id';

/**
 * Generate or retrieve a stable anonymous session ID.
 * Used to deduplicate click events. Never tied to personal identity.
 */
export function getSessionId() {
  let id = sessionStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}

/**
 * Capture a referral code from URL params into session storage.
 * First-touch: only stores the code if one isn't already stored.
 */
export function captureReferralCode() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('ref');
  if (code && !sessionStorage.getItem(SESSION_KEY)) {
    sessionStorage.setItem(SESSION_KEY, code.trim().toUpperCase());
  }
  return sessionStorage.getItem(SESSION_KEY);
}

/**
 * Read the currently captured referral code.
 */
export function getReferralCode() {
  return sessionStorage.getItem(SESSION_KEY) || null;
}

/**
 * Clear the referral code (used after successful registration).
 */
export function clearReferralCode() {
  sessionStorage.removeItem(SESSION_KEY);
}

/**
 * Generate a clean, readable personal referral code for a registrant.
 * e.g., 'ARJUN8A2F'
 */
export function generateStudentReferralCode(fullName, seed) {
  const firstWordLetters = (fullName || '')
    .trim()
    .split(/\s+/)[0]
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase();
  const prefix = firstWordLetters.length >= 3 ? firstWordLetters.slice(0, 6) : 'STUDENT';
  const cleanSeed = (seed ? String(seed) : Math.random().toString(36).slice(2, 6))
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();
  const suffix = cleanSeed.slice(-4) || '2026';
  return `${prefix}${suffix}`;
}

/**
 * Build a shareable referral URL.
 */
export function buildReferralUrl(referralCode) {
  const base = (typeof window !== 'undefined' && window.location?.origin)
    ? window.location.origin
    : (import.meta.env.VITE_APP_URL || 'http://localhost:5173');
  return `${base}/register?ref=${encodeURIComponent(referralCode || '')}`;
}

/**
 * Copy text to clipboard — returns boolean success.
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(el);
    return ok;
  }
}

/**
 * Trigger native share if supported.
 */
export async function nativeShare(url, title, text) {
  if (navigator.share) {
    await navigator.share({ title, text, url });
    return true;
  }
  return false;
}

/**
 * Category display helpers
 */
export const CATEGORY_LABELS = {
  student: 'Student Ambassador',
  club_convener: 'Club Convener',
  content_creator: 'Content Creator',
  campus_hostel: 'Campus / Hostel',
  institutional_email: 'Institutional Email',
};

export const CATEGORY_COLORS = {
  student: '#2563EB',
  club_convener: '#7C3AED',
  content_creator: '#DC2626',
  campus_hostel: '#D97706',
  institutional_email: '#059669',
};

export function getCategoryLabel(cat) {
  return CATEGORY_LABELS[cat] || cat;
}

export function getCategoryColor(cat) {
  return CATEGORY_COLORS[cat] || '#6B7280';
}
