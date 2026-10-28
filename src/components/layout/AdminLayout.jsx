import { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCheck, Settings,
  LogOut, Menu, X, Zap, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/admin',               icon: LayoutDashboard, label: 'Dashboard',      end: true },
  { to: '/admin/promoters',     icon: Users,           label: 'Promoters'       },
  { to: '/admin/registrations', icon: UserCheck,       label: 'Registrations'   },
  { to: '/admin/settings',      icon: Settings,        label: 'Settings'        },
];

export default function AdminLayout({ children, title }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate('/admin/login');
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`} aria-label="Admin navigation">
        {/* Brand */}
        <div className="admin-sidebar-brand">
          <div style={{display:'flex',alignItems:'center',gap:'var(--space-3)'}}>
            <div style={{
              width:32,height:32,
              background:'rgba(255,255,255,0.1)',
              borderRadius:'var(--radius)',
              display:'flex',alignItems:'center',justifyContent:'center',
            }}>
              <Zap size={18} color="white" />
            </div>
            <div>
              <div style={{fontSize:'var(--text-sm)'}}>Campus Growth</div>
              <div style={{fontSize:'var(--text-xs)',color:'rgba(255,255,255,0.4)',fontWeight:'normal'}}>Admin Panel</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{flex:1,padding:'var(--space-4) 0'}}>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* View public site */}
        <div style={{padding:'var(--space-4) var(--space-6)',borderTop:'1px solid rgba(255,255,255,0.1)'}}>
          <Link to="/" className="admin-nav-link" style={{padding:0,marginBottom:'var(--space-3)'}}>
            <ChevronRight size={16} />
            View public site
          </Link>
          {/* User info */}
          <div style={{
            padding:'var(--space-3)',
            background:'rgba(255,255,255,0.07)',
            borderRadius:'var(--radius)',
            marginBottom:'var(--space-3)',
          }}>
            <div style={{fontSize:'var(--text-xs)',color:'rgba(255,255,255,0.4)',marginBottom:2}}>Signed in as</div>
            <div style={{fontSize:'var(--text-xs)',color:'rgba(255,255,255,0.8)',wordBreak:'break-all'}}>{user?.email}</div>
          </div>
          <button
            onClick={handleSignOut}
            className="btn btn-sm btn-ghost"
            style={{color:'rgba(255,255,255,0.5)',width:'100%',justifyContent:'flex-start',gap:'var(--space-2)'}}
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div style={{display:'flex',alignItems:'center',gap:'var(--space-4)'}}>
            <button
              className="btn btn-ghost show-mobile"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
              style={{padding:'var(--space-2)'}}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 style={{
              fontFamily:'var(--font-display)',
              fontSize:'var(--text-lg)',
              fontWeight:'var(--fw-bold)',
              color:'var(--color-navy-900)',
            }}>
              {title}
            </h1>
          </div>
        </header>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',zIndex:199,
            }}
          />
        )}

        {/* Content */}
        <div className="admin-content">
          {children}
        </div>
      </div>
    </div>
  );
}
