import { Link } from 'react-router-dom';
import { Zap, Mail, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        {/* Top grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-8)',
          marginBottom: 'var(--space-8)'
        }}>
          {/* Brand col */}
          <div>
            <div style={{display:'flex',alignItems:'center',gap:'var(--space-3)',marginBottom:'var(--space-4)'}}>
              <div style={{
                width:36,height:36,
                background:'rgba(255,255,255,0.1)',
                borderRadius:'var(--radius)',
                display:'flex',alignItems:'center',justifyContent:'center'
              }}>
                <Zap size={20} color="white" />
              </div>
              <span className="footer-brand">Campus Growth</span>
            </div>
            <p style={{fontSize:'var(--text-sm)',lineHeight:1.7,color:'rgba(255,255,255,0.55)'}}>
              A campaign prototype built for the NxtWave Growth Intern challenge.
              This is not an official NxtWave product.
            </p>
          </div>

          {/* Links col */}
          <div>
            <p style={{color:'white',fontWeight:'var(--fw-semibold)',marginBottom:'var(--space-4)',fontSize:'var(--text-sm)'}}>
              Quick Links
            </p>
            <div style={{display:'flex',flexDirection:'column',gap:'var(--space-2)'}}>
              <Link to="/" style={{fontSize:'var(--text-sm)'}}>Home</Link>
              <Link to="/register" style={{fontSize:'var(--text-sm)'}}>Register</Link>
              <Link to="/leaderboard" style={{fontSize:'var(--text-sm)'}}>Leaderboard</Link>
              <Link to="/admin/login" style={{fontSize:'var(--text-sm)'}}>Admin</Link>
            </div>
          </div>

          {/* Contact col */}
          <div>
            <p style={{color:'white',fontWeight:'var(--fw-semibold)',marginBottom:'var(--space-4)',fontSize:'var(--text-sm)'}}>
              Contact
            </p>
            <div style={{display:'flex',alignItems:'center',gap:'var(--space-2)',fontSize:'var(--text-sm)'}}>
              <Mail size={14} />
              <span>campaign@example.com</span>
            </div>
            <p style={{fontSize:'var(--text-xs)',marginTop:'var(--space-3)',color:'rgba(255,255,255,0.4)'}}>
              (Placeholder — configure in Admin Settings)
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="footer-disclaimer">
          <p>
            <strong style={{color:'rgba(255,255,255,0.6)'}}>Privacy Notice:</strong>{' '}
            Registration information (name, email, college) is collected solely to manage workshop
            registrations and referral attribution for this campaign prototype.
            No data is shared with third parties or used for marketing purposes.
            Referral tracking uses anonymous session identifiers.
          </p>
          <p style={{marginTop:'var(--space-3)'}}>
            <strong style={{color:'rgba(255,255,255,0.6)'}}>Disclaimer:</strong>{' '}
            Campus Growth is a prototype created for the NxtWave Growth Intern assessment (2026).
            It does not represent official NxtWave products or services. All workshop details
            are placeholders pending official confirmation.
          </p>
          <p style={{marginTop:'var(--space-4)',color:'rgba(255,255,255,0.3)'}}>
            © 2026 Campus Growth — NxtWave Growth Intern Challenge Prototype
          </p>
        </div>
      </div>
    </footer>
  );
}
