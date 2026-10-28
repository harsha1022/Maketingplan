import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, Zap, Lock, Eye, EyeOff, Info, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { signIn, signInDemoAdmin, user, isAdmin } = useAuth();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    document.title = 'Admin Login — Campus Growth';
    if (user && isAdmin) navigate('/admin', { replace: true });
  }, [user, isAdmin, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || (!password && isSupabaseConfigured)) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    setError('');

    const { error: authError } = await signIn(email, password);
    if (authError) {
      setError(authError.message || 'Login failed. Check your credentials.');
      setLoading(false);
    } else {
      navigate('/admin', { replace: true });
    }
  }

  async function handleDemoAdminClick() {
    setLoading(true);
    setError('');
    await signInDemoAdmin();
    navigate('/admin', { replace: true });
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-gray-50)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-6)',
    }}>
      {/* Logo */}
      <Link to="/" style={{
        display:'flex',alignItems:'center',gap:'var(--space-3)',
        marginBottom:'var(--space-8)',
        fontFamily:'var(--font-display)',
        fontWeight:'var(--fw-bold)',
        fontSize:'var(--text-lg)',
        color:'var(--color-navy-900)',
        textDecoration:'none',
      }}>
        <div style={{
          width:40,height:40,
          background:'linear-gradient(135deg,var(--color-navy-800),var(--color-navy-600))',
          borderRadius:'var(--radius)',
          display:'flex',alignItems:'center',justifyContent:'center',
        }}>
          <Zap size={20} color="white" />
        </div>
        Campus Growth
      </Link>

      <div className="card" style={{width:'100%',maxWidth:440,padding:'var(--space-8)'}}>
        <div style={{textAlign:'center',marginBottom:'var(--space-6)'}}>
          <div style={{
            width:56,height:56,
            background:'var(--color-gray-100)',
            borderRadius:'50%',
            display:'flex',alignItems:'center',justifyContent:'center',
            margin:'0 auto var(--space-4)',
          }}>
            <Lock size={24} color="var(--color-gray-600)" />
          </div>
          <h1 style={{
            fontFamily:'var(--font-display)',
            fontSize:'var(--text-2xl)',
            fontWeight:'var(--fw-bold)',
            color:'var(--color-navy-900)',
            marginBottom:'var(--space-2)',
          }}>
            Admin Login
          </h1>
          <p style={{fontSize:'var(--text-sm)',color:'var(--color-gray-500)'}}>
            Authorized campaign administrators only
          </p>
        </div>

        <div style={{marginBottom:'var(--space-6)'}}>
          <button
            type="button"
            onClick={handleDemoAdminClick}
            className="btn btn-secondary w-full"
            style={{
              justifyContent:'center',
              fontWeight:'var(--fw-semibold)',
              padding:'var(--space-3) var(--space-4)',
              background:'var(--color-navy-50)',
              color:'var(--color-navy-800)',
              border:'1px solid var(--color-navy-200)',
            }}
          >
            ⚡ Preview Demo Analytics & Dashboard <ArrowRight size={16} />
          </button>
          
          <div style={{
            display:'flex',
            alignItems:'center',
            margin:'var(--space-5) 0 var(--space-2)',
            color:'var(--color-gray-400)',
            fontSize:'var(--text-xs)',
          }}>
            <div style={{flex:1,height:1,background:'var(--color-gray-200)'}} />
            <span style={{padding:'0 var(--space-3)'}}>or sign in with Supabase credentials</span>
            <div style={{flex:1,height:1,background:'var(--color-gray-200)'}} />
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group" style={{marginBottom:'var(--space-4)'}}>
            <label htmlFor="admin-email" className="form-label">
              Admin email <span className="required">*</span>
            </label>
            <input
              id="admin-email"
              type="email"
              className="form-input"
              placeholder={isSupabaseConfigured ? 'admin@example.com' : 'admin@demo.campusgrowth'}
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              autoComplete="email"
              disabled={loading}
              aria-required="true"
            />
          </div>

          <div className="form-group" style={{marginBottom:'var(--space-6)'}}>
            <label htmlFor="admin-password" className="form-label">
              Password {isSupabaseConfigured && <span className="required">*</span>}
            </label>
            <div style={{position:'relative'}}>
              <input
                id="admin-password"
                type={showPass ? 'text' : 'password'}
                className="form-input"
                placeholder={isSupabaseConfigured ? 'Your password' : 'Any password in demo mode'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                autoComplete="current-password"
                disabled={loading}
                aria-required="true"
                style={{paddingRight:'var(--space-10)'}}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
                style={{
                  position:'absolute',right:'var(--space-3)',top:'50%',
                  transform:'translateY(-50%)',
                  background:'none',border:'none',
                  color:'var(--color-gray-400)',cursor:'pointer',
                  display:'flex',alignItems:'center',
                }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-error" style={{marginBottom:'var(--space-4)'}} role="alert">
              <AlertCircle size={16} style={{flexShrink:0}} />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-full"
            id="admin-login-btn"
            disabled={loading}
          >
            {loading
              ? <><span className="spinner" style={{borderTopColor:'white'}} /> Signing in…</>
              : isSupabaseConfigured ? 'Sign In with Supabase' : 'Sign In'}
          </button>
        </form>
      </div>

      <p style={{marginTop:'var(--space-6)',fontSize:'var(--text-xs)',color:'var(--color-gray-400)',textAlign:'center'}}>
        This is a protected admin area.
        <br />
        <Link to="/" style={{color:'var(--color-blue-600)',marginTop:4,display:'inline-block'}}>← Back to public site</Link>
      </p>
    </div>
  );
}
