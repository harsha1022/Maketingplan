import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { CheckCircle, Share2, Copy, ExternalLink, Trophy, Info } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { buildReferralUrl, copyToClipboard, nativeShare } from '../lib/referral';

export default function ConfirmationPage() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = 'Registration Confirmed — Campus Growth';
    if (!state?.registrationId) navigate('/', { replace: true });
  }, [state, navigate]);

  if (!state?.registrationId) return null;

  const {
    registrationId, fullName, email, college,
    studyYear, attributedTo, attributionSource, isDemo,
  } = state;

  // The share link is just the registration page (no personal code for registrants unless they're also promoters)
  // For this platform, regular students share the base register URL.
  const shareUrl = import.meta.env.VITE_APP_URL
    ? `${import.meta.env.VITE_APP_URL}/register`
    : `${window.location.origin}/register`;

  async function handleCopy() {
    const ok = await copyToClipboard(shareUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  async function handleShare() {
    const shared = await nativeShare(
      shareUrl,
      'Free AI Workshop — Build Your First AI Project in 60 Minutes',
      'Register for free! A hands-on online workshop for final-year engineering students.'
    );
    if (!shared) handleCopy();
  }

  return (
    <>
      <Navbar />

      <main style={{
        minHeight: 'calc(100vh - 64px)',
        background: 'var(--color-gray-50)',
        padding: 'var(--space-12) 0',
      }}>
        <div className="container" style={{maxWidth:580}}>

          {/* Demo notice */}
          {isDemo && (
            <div className="alert alert-warning" style={{marginBottom:'var(--space-6)'}}>
              <Info size={16} style={{flexShrink:0}} />
              <div>
                <strong>Demo Mode:</strong> This registration was simulated locally.
                No data was saved to a database. Configure Supabase to enable real registrations.
              </div>
            </div>
          )}

          {/* Success card */}
          <div className="card" style={{textAlign:'center',padding:'var(--space-10) var(--space-8)'}}>
            <div style={{
              width:72, height:72,
              background:'var(--color-green-50)',
              borderRadius:'50%',
              display:'flex', alignItems:'center', justifyContent:'center',
              margin:'0 auto var(--space-6)',
            }}>
              <CheckCircle size={36} color="var(--color-green-600)" />
            </div>

            <h1 style={{
              fontFamily:'var(--font-display)',
              fontSize:'var(--text-2xl)',
              fontWeight:'var(--fw-bold)',
              color:'var(--color-navy-900)',
              marginBottom:'var(--space-2)',
            }}>
              You're registered!
            </h1>
            <p style={{color:'var(--color-gray-500)',fontSize:'var(--text-base)',marginBottom:'var(--space-8)'}}>
              Workshop joining details will be shared by the official organizer
              before the session.
            </p>

            {/* Registration details */}
            <div style={{
              background:'var(--color-gray-50)',
              border:'1px solid var(--color-gray-200)',
              borderRadius:'var(--radius)',
              padding:'var(--space-5)',
              textAlign:'left',
              marginBottom:'var(--space-6)',
            }}>
              <div style={{
                fontSize:'var(--text-xs)',
                fontWeight:'var(--fw-semibold)',
                textTransform:'uppercase',
                letterSpacing:'0.06em',
                color:'var(--color-gray-500)',
                marginBottom:'var(--space-4)',
              }}>
                Registration Summary
              </div>
              {[
                ['Registration ID', registrationId],
                ['Name', fullName],
                ['Email', email],
                ['College', college],
                ['Year', studyYear],
                ['Referred by', attributedTo || 'Direct registration'],
              ].map(([label, value]) => (
                <div key={label} style={{
                  display:'flex',
                  justifyContent:'space-between',
                  gap:'var(--space-4)',
                  padding:'var(--space-2) 0',
                  borderBottom:'1px solid var(--color-gray-100)',
                  fontSize:'var(--text-sm)',
                }}>
                  <span style={{color:'var(--color-gray-500)',flexShrink:0}}>{label}</span>
                  <span style={{fontWeight:'var(--fw-medium)',color:'var(--color-navy-900)',textAlign:'right',wordBreak:'break-all'}}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Share section */}
            <div style={{
              background:'linear-gradient(135deg,var(--color-navy-900),var(--color-navy-700))',
              borderRadius:'var(--radius-lg)',
              padding:'var(--space-6)',
              color:'white',
              marginBottom:'var(--space-6)',
            }}>
              <div style={{display:'flex',alignItems:'center',gap:'var(--space-2)',marginBottom:'var(--space-3)'}}>
                <Trophy size={18} color="var(--color-amber-500)" />
                <span style={{fontWeight:'var(--fw-semibold)'}}>Know a final-year student?</span>
              </div>
              <p style={{fontSize:'var(--text-sm)',color:'rgba(255,255,255,0.7)',marginBottom:'var(--space-4)',lineHeight:1.6}}>
                Share the workshop with friends. If you're a registered student promoter,
                use your personal referral link (provided separately by the organizer).
              </p>
              <div style={{
                background:'rgba(255,255,255,0.1)',
                borderRadius:'var(--radius)',
                padding:'var(--space-3)',
                fontSize:'var(--text-xs)',
                fontFamily:'monospace',
                color:'rgba(255,255,255,0.8)',
                marginBottom:'var(--space-4)',
                wordBreak:'break-all',
              }}>
                {shareUrl}
              </div>
              <div style={{display:'flex',gap:'var(--space-3)',flexWrap:'wrap'}}>
                <button
                  onClick={handleCopy}
                  className="btn btn-sm"
                  id="confirmation-copy-btn"
                  style={{background:'rgba(255,255,255,0.15)',color:'white',border:'1px solid rgba(255,255,255,0.2)'}}
                >
                  <Copy size={14} />
                  {copied ? 'Copied!' : 'Copy link'}
                </button>
                <button
                  onClick={handleShare}
                  className="btn btn-sm"
                  id="confirmation-share-btn"
                  style={{background:'var(--color-green-600)',color:'white',border:'none'}}
                >
                  <Share2 size={14} />
                  Share
                </button>
              </div>
            </div>

            {/* CTA links */}
            <div style={{display:'flex',flexWrap:'wrap',gap:'var(--space-3)',justifyContent:'center'}}>
              <Link to="/leaderboard" className="btn btn-outline" id="confirmation-leaderboard-btn">
                <Trophy size={16} />
                View Leaderboard
              </Link>
              <Link to="/" className="btn btn-ghost" id="confirmation-home-btn">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
