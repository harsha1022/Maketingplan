import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Zap } from 'lucide-react';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="nav" role="navigation" aria-label="Main navigation">
      <div className="nav-inner">
        {/* Brand */}
        <Link to="/" className="nav-brand" id="nav-brand">
          <div style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, var(--color-navy-800), var(--color-navy-600))',
            borderRadius: 'var(--radius)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Zap size={18} color="white" />
          </div>
          Campus Growth
        </Link>

        {/* Desktop links */}
        <ul className="nav-links hide-mobile">
          <li><NavLink to="/" end className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>Home</NavLink></li>
          <li><NavLink to="/leaderboard" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>Leaderboard</NavLink></li>
          <li>
            <Link to="/register" className="btn btn-primary btn-sm" id="nav-register-btn">
              Register Free
            </Link>
          </li>
        </ul>

        {/* Mobile hamburger */}
        <button
          className="btn btn-ghost show-mobile"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          id="nav-mobile-toggle"
          style={{padding:'var(--space-2)'}}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{
          borderTop: '1px solid var(--color-gray-200)',
          background: 'white',
          padding: 'var(--space-4) var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}>
          <NavLink to="/" end className="nav-link" onClick={() => setOpen(false)}>Home</NavLink>
          <NavLink to="/leaderboard" className="nav-link" onClick={() => setOpen(false)}>Leaderboard</NavLink>
          <Link to="/register" className="btn btn-primary" onClick={() => setOpen(false)} id="nav-mobile-register-btn">
            Register Free
          </Link>
        </div>
      )}
    </nav>
  );
}
