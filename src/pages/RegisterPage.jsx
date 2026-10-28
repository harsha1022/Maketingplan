import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Lock, Info } from 'lucide-react';

import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import {
  validateRegistrationForm,
  normalizeEmail,
} from '../lib/validation';
import {
  captureReferralCode,
  getSessionId,
} from '../lib/referral';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// ── Demo mode local registration simulation ────────────────────
const DEMO_EMAIL_STORE_KEY = 'cg_demo_registrations';

function getDemoRegistrations() {
  try { return JSON.parse(sessionStorage.getItem(DEMO_EMAIL_STORE_KEY) || '[]'); }
  catch { return []; }
}

function addDemoRegistration(email) {
  const list = getDemoRegistrations();
  list.push(normalizeEmail(email));
  sessionStorage.setItem(DEMO_EMAIL_STORE_KEY, JSON.stringify(list));
}

function isDemoEmailTaken(email) {
  return getDemoRegistrations().includes(normalizeEmail(email));
}

async function submitRegistrationDemo(values, referralCode) {
  await new Promise(r => setTimeout(r, 1200));
  if (isDemoEmailTaken(values.email)) {
    return { success: false, error: 'duplicate_email', message: 'This email address is already registered.' };
  }
  addDemoRegistration(values.email);
  return {
    success: true,
    registration_id: 'DEMO-' + Math.random().toString(36).slice(2, 10).toUpperCase(),
    attributed_to: referralCode ? 'Demo Promoter' : null,
    attribution_source: referralCode ? 'student' : 'direct',
  };
}

async function submitRegistrationSupabase(values, referralCode, sessionId) {
  const { data, error } = await supabase.rpc('register_student', {
    p_full_name:     values.fullName,
    p_email:         values.email,
    p_college:       values.college,
    p_study_year:    values.studyYear,
    p_phone:         values.phone || null,
    p_referral_code: referralCode,
    p_session_id:    sessionId,
  });
  if (error) return { success: false, error: 'server_error', message: error.message };
  return data;
}

// ── Form Component ─────────────────────────────────────────────
export default function RegisterPage() {
  const navigate = useNavigate();

  const [values, setValues] = useState({
    fullName: '',
    email: '',
    college: '',
    studyYear: '',
    phone: '',
  });
  const [errors, setErrors]       = useState({});
  const [status, setStatus]       = useState('idle'); // idle | loading | success | error
  const [serverMsg, setServerMsg] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [promoterInfo, setPromoterInfo] = useState(null);

  useEffect(() => {
    document.title = 'Register — Campus Growth';
    const code = captureReferralCode();
    setReferralCode(code || '');
    if (code && isSupabaseConfigured && supabase) {
      supabase.rpc('log_referral_click', {
        p_referral_code: code,
        p_session_id: getSessionId(),
      }).then(({ data }) => {
        if (data?.valid) setPromoterInfo(data);
      });
    }
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setValues(v => ({ ...v, [name]: value }));
    // Clear field error on change
    if (errors[name]) setErrors(e => ({ ...e, [name]: undefined }));
  }

  function handleBlur(e) {
    const { name } = e.target;
    const fieldErrors = validateRegistrationForm({ ...values });
    if (fieldErrors[name]) {
      setErrors(prev => ({ ...prev, [name]: fieldErrors[name] }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validateRegistrationForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErrorId = Object.keys(validationErrors)[0];
      document.getElementById(firstErrorId)?.focus();
      return;
    }

    setStatus('loading');
    setServerMsg('');

    let result;
    if (isSupabaseConfigured && supabase) {
      result = await submitRegistrationSupabase(values, referralCode, getSessionId());
    } else {
      result = await submitRegistrationDemo(values, referralCode);
    }

    if (result.success) {
      setStatus('success');
      navigate('/confirmation', {
        state: {
          registrationId: result.registration_id,
          fullName: values.fullName,
          email: values.email,
          college: values.college,
          studyYear: values.studyYear,
          attributedTo: result.attributed_to,
          attributionSource: result.attribution_source,
          isDemo: !isSupabaseConfigured,
        },
      });
    } else if (result.error === 'duplicate_email') {
      setStatus('duplicate');
      setServerMsg(result.message);
    } else {
      setStatus('error');
      setServerMsg(result.message || 'Something went wrong. Please try again.');
    }
  }

  return (
    <>
      <Navbar />

      <main style={{
        minHeight: 'calc(100vh - 64px)',
        background: 'var(--color-gray-50)',
        padding: 'var(--space-12) 0',
      }}>
        <div className="container" style={{maxWidth:600}}>

          {/* Header */}
          <div style={{textAlign:'center',marginBottom:'var(--space-8)'}}>
            <p className="section-label">Free Workshop</p>
            <h1 style={{
              fontFamily:'var(--font-display)',
              fontSize:'var(--text-3xl)',
              fontWeight:'var(--fw-bold)',
              color:'var(--color-navy-900)',
              marginBottom:'var(--space-3)',
            }}>
              Register for the AI Workshop
            </h1>
            <p style={{fontSize:'var(--text-base)',color:'var(--color-gray-500)'}}>
              Build Your First AI Project in 60 Minutes — free, online, beginner-friendly.
            </p>
          </div>

          {/* Referral banner */}
          {referralCode && (
            <div className="alert alert-info" style={{marginBottom:'var(--space-6)'}}>
              <Info size={16} style={{flexShrink:0,marginTop:1}} />
              <div>
                <span style={{fontWeight:'var(--fw-semibold)'}}>
                  {promoterInfo?.promoter_name
                    ? `Referred by ${promoterInfo.promoter_name}`
                    : `Referral code applied: ${referralCode}`}
                </span>
                {' '}— your registration will be attributed to this referral.
              </div>
            </div>
          )}

          {/* Demo mode notice */}
          {!isSupabaseConfigured && (
            <div className="alert alert-warning" style={{marginBottom:'var(--space-6)'}}>
              <AlertCircle size={16} style={{flexShrink:0,marginTop:1}} />
              <div>
                <strong>Demo Mode</strong> — Supabase is not configured. Registrations are simulated
                locally in this browser session and are not persisted to any database.
              </div>
            </div>
          )}

          {/* Form card */}
          <div className="card" style={{padding:'var(--space-8)'}}>
            <form onSubmit={handleSubmit} noValidate aria-label="Workshop registration form">

              {/* Full Name */}
              <div className="form-group" style={{marginBottom:'var(--space-5)'}}>
                <label htmlFor="fullName" className="form-label">
                  Full name <span className="required">*</span>
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  className={'form-input' + (errors.fullName ? ' error' : '')}
                  placeholder="e.g. Priya Sharma"
                  value={values.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="name"
                  disabled={status === 'loading'}
                  aria-required="true"
                  aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                />
                {errors.fullName && (
                  <span id="fullName-error" className="form-error" role="alert">
                    <AlertCircle size={12} /> {errors.fullName}
                  </span>
                )}
              </div>

              {/* Email */}
              <div className="form-group" style={{marginBottom:'var(--space-5)'}}>
                <label htmlFor="email" className="form-label">
                  Email address <span className="required">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={'form-input' + (errors.email ? ' error' : '')}
                  placeholder="you@example.com"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="email"
                  disabled={status === 'loading'}
                  aria-required="true"
                  aria-describedby={errors.email ? 'email-error' : 'email-hint'}
                />
                {errors.email ? (
                  <span id="email-error" className="form-error" role="alert">
                    <AlertCircle size={12} /> {errors.email}
                  </span>
                ) : (
                  <span id="email-hint" className="form-hint">
                    Used only for workshop communications. Not shared with third parties.
                  </span>
                )}
              </div>

              {/* College */}
              <div className="form-group" style={{marginBottom:'var(--space-5)'}}>
                <label htmlFor="college" className="form-label">
                  College / University <span className="required">*</span>
                </label>
                <input
                  id="college"
                  name="college"
                  type="text"
                  className={'form-input' + (errors.college ? ' error' : '')}
                  placeholder="e.g. IIT Hyderabad"
                  value={values.college}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={status === 'loading'}
                  aria-required="true"
                  aria-describedby={errors.college ? 'college-error' : undefined}
                />
                {errors.college && (
                  <span id="college-error" className="form-error" role="alert">
                    <AlertCircle size={12} /> {errors.college}
                  </span>
                )}
              </div>

              {/* Study Year */}
              <div className="form-group" style={{marginBottom:'var(--space-5)'}}>
                <label htmlFor="studyYear" className="form-label">
                  Year of study <span className="required">*</span>
                </label>
                <select
                  id="studyYear"
                  name="studyYear"
                  className={'form-select' + (errors.studyYear ? ' error' : '')}
                  value={values.studyYear}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={status === 'loading'}
                  aria-required="true"
                  aria-describedby={errors.studyYear ? 'studyYear-error' : 'studyYear-hint'}
                >
                  <option value="">Select your year</option>
                  <option value="Final Year">Final Year (B.Tech / BE)</option>
                  <option value="4th Year">4th Year</option>
                  <option value="B.Tech 4th Year">B.Tech 4th Year</option>
                  <option value="BE 4th Year">BE 4th Year</option>
                  <option disabled value="other">─── (Other years not eligible) ───</option>
                  <option disabled value="3rd">3rd Year</option>
                  <option disabled value="2nd">2nd Year</option>
                  <option disabled value="1st">1st Year</option>
                </select>
                {errors.studyYear ? (
                  <span id="studyYear-error" className="form-error" role="alert">
                    <AlertCircle size={12} /> {errors.studyYear}
                  </span>
                ) : (
                  <span id="studyYear-hint" className="form-hint">
                    This workshop is open to final-year students only.
                  </span>
                )}
              </div>

              {/* Phone (optional) */}
              <div className="form-group" style={{marginBottom:'var(--space-6)'}}>
                <label htmlFor="phone" className="form-label">
                  Phone number <span style={{fontWeight:'var(--fw-normal)',color:'var(--color-gray-400)'}}>
                    (optional)
                  </span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className={'form-input' + (errors.phone ? ' error' : '')}
                  placeholder="10-digit mobile number"
                  value={values.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="tel"
                  disabled={status === 'loading'}
                  aria-describedby={errors.phone ? 'phone-error' : 'phone-hint'}
                />
                {errors.phone ? (
                  <span id="phone-error" className="form-error" role="alert">
                    <AlertCircle size={12} /> {errors.phone}
                  </span>
                ) : (
                  <span id="phone-hint" className="form-hint">
                    Optional. Collected only to help the organizer share joining details if needed.
                  </span>
                )}
              </div>

              {/* Server-level errors */}
              {(status === 'duplicate' || status === 'error') && (
                <div className={`alert ${status === 'duplicate' ? 'alert-warning' : 'alert-error'}`}
                  style={{marginBottom:'var(--space-5)'}} role="alert">
                  <AlertCircle size={16} style={{flexShrink:0}} />
                  <div>
                    {status === 'duplicate' ? (
                      <>
                        <strong>Already registered</strong> — {serverMsg}
                        {' '}If you think this is a mistake, contact the organizer.
                      </>
                    ) : (
                      <><strong>Registration failed</strong> — {serverMsg}</>
                    )}
                  </div>
                </div>
              )}

              {/* Privacy notice */}
              <p style={{
                fontSize:'var(--text-xs)',
                color:'var(--color-gray-500)',
                marginBottom:'var(--space-6)',
                lineHeight:1.6,
                padding:'var(--space-3)',
                background:'var(--color-gray-50)',
                borderRadius:'var(--radius)',
              }}>
                <Lock size={11} style={{verticalAlign:'middle',marginRight:4}} />
                Your information is collected only for this workshop campaign. It is not sold,
                shared, or used for any other marketing. See the <a href="#footer-privacy" style={{color:'var(--color-blue-600)'}}>Privacy Notice</a> at the bottom of this page.
              </p>

              {/* Submit */}
              <button
                type="submit"
                className="btn btn-green btn-lg w-full"
                id="register-submit-btn"
                disabled={status === 'loading'}
                aria-busy={status === 'loading'}
              >
                {status === 'loading'
                  ? <><span className="spinner" style={{borderTopColor:'white'}} /> Registering…</>
                  : 'Register for Free'}
              </button>
            </form>
          </div>

          {/* Already registered note */}
          <p style={{
            textAlign:'center',
            fontSize:'var(--text-sm)',
            color:'var(--color-gray-500)',
            marginTop:'var(--space-6)',
          }}>
            Already registered? Your registration details were shown at confirmation.
            Contact the organizer if you need to make changes.
          </p>
        </div>
      </main>

      <span id="footer-privacy" />
      <Footer />
    </>
  );
}
