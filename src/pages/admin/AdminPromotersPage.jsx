import { useState, useEffect } from 'react';
import {
  Plus, Copy, Download, QrCode, Power, PowerOff,
  Search, Info, AlertTriangle, Check,
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import AdminLayout from '../../components/layout/AdminLayout';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { downloadCSV, flattenPromoterForExport } from '../../lib/export';
import { buildReferralUrl, copyToClipboard, getCategoryLabel, getCategoryColor, CATEGORY_LABELS } from '../../lib/referral';

const isDemo = !isSupabaseConfigured;

import { useAuth } from '../../context/AuthContext';

// ── 3-Day Active Campaign Promoters (Exact Match with 18 Registrations) ──
const DEMO_PROMOTERS = [
  { id:'1',display_name:'Arjun Sharma',category:'student',college_or_club:'IIT Hyderabad',referral_code:'STUDENT001',active:true,is_demo:true,created_at:'2026-10-27T08:00:00Z',registrations:3,clicks:7 },
  { id:'2',display_name:'Priya Nair',category:'student',college_or_club:'NIT Warangal',referral_code:'STUDENT002',active:true,is_demo:true,created_at:'2026-10-27T08:30:00Z',registrations:2,clicks:5 },
  { id:'3',display_name:'Rahul Verma',category:'student',college_or_club:'BITS Pilani',referral_code:'STUDENT003',active:true,is_demo:true,created_at:'2026-10-27T09:00:00Z',registrations:1,clicks:3 },
  { id:'4',display_name:'Sneha Patel',category:'student',college_or_club:'VNR VJIET',referral_code:'STUDENT004',active:true,is_demo:true,created_at:'2026-10-27T10:00:00Z',registrations:1,clicks:2 },
  { id:'5',display_name:'CSE Club — CBIT',category:'club_convener',college_or_club:'CBIT Hyderabad',referral_code:'CSECLUB01',active:true,is_demo:true,created_at:'2026-10-27T09:15:00Z',registrations:2,clicks:5 },
  { id:'6',display_name:'IEEE Chapter — VIT',category:'club_convener',college_or_club:'VIT Vellore',referral_code:'IEEE001',active:true,is_demo:true,created_at:'2026-10-27T09:45:00Z',registrations:2,clicks:4 },
  { id:'7',display_name:'E-Cell MJCET',category:'club_convener',college_or_club:'MJCET Hyderabad',referral_code:'ECELL001',active:true,is_demo:true,created_at:'2026-10-27T11:00:00Z',registrations:1,clicks:3 },
  { id:'8',display_name:'TechWithRiya (YouTube)',category:'content_creator',college_or_club:null,referral_code:'CREATOR01',active:true,is_demo:true,created_at:'2026-10-27T10:30:00Z',registrations:2,clicks:8 },
  { id:'9',display_name:'CodeWithSam (Instagram)',category:'content_creator',college_or_club:null,referral_code:'CREATOR02',active:true,is_demo:true,created_at:'2026-10-27T12:00:00Z',registrations:1,clicks:4 },
  { id:'10',display_name:'Hostel Block-A QR',category:'campus_hostel',college_or_club:'IIT H Hostel',referral_code:'HOSTELQR01',active:true,is_demo:true,created_at:'2026-10-27T08:15:00Z',registrations:1,clicks:3 },
  { id:'11',display_name:'Dean Academic Email',category:'institutional_email',college_or_club:'IIT Hyderabad',referral_code:'DEANEMAIL01',active:true,is_demo:true,created_at:'2026-10-27T09:00:00Z',registrations:1,clicks:2 },
];

// ── QR Code Modal ──────────────────────────────────────────────
function QRModal({ promoter, onClose }) {
  const url = buildReferralUrl(promoter.referral_code);

  function handleDownload() {
    const canvas = document.querySelector('#qr-canvas canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `qr_${promoter.referral_code}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  async function handleCopy() { await copyToClipboard(url); }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'var(--space-6)'}}>
          <div>
            <h2 style={{fontFamily:'var(--font-display)',fontWeight:'var(--fw-bold)',color:'var(--color-navy-900)'}}>
              QR Code
            </h2>
            <p style={{fontSize:'var(--text-sm)',color:'var(--color-gray-500)'}}>
              {promoter.display_name}
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm">✕</button>
        </div>

        <div id="qr-canvas" style={{
          display:'flex',justifyContent:'center',alignItems:'center',
          padding:'var(--space-6)',
          background:'white',
          border:'2px solid var(--color-gray-200)',
          borderRadius:'var(--radius-lg)',
          marginBottom:'var(--space-4)',
        }}>
          <QRCodeCanvas value={url} size={200} level="H" includeMargin />
        </div>

        <div style={{
          background:'var(--color-gray-50)',
          borderRadius:'var(--radius)',
          padding:'var(--space-3)',
          fontSize:'var(--text-xs)',
          fontFamily:'monospace',
          color:'var(--color-gray-600)',
          wordBreak:'break-all',
          marginBottom:'var(--space-4)',
        }}>
          {url}
        </div>

        <div style={{display:'flex',gap:'var(--space-3)'}}>
          <button onClick={handleDownload} className="btn btn-primary" style={{flex:1}} id="qr-download-btn">
            <Download size={16} /> Download PNG
          </button>
          <button onClick={handleCopy} className="btn btn-outline" id="qr-copy-btn">
            <Copy size={16} /> Copy URL
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add Promoter Modal ─────────────────────────────────────────
function AddPromoterModal({ onClose, onAdded }) {
  const [form, setForm] = useState({
    display_name: '', category: 'student', college_or_club: '', contact_email: '',
    referral_code: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // Auto-generate referral code from name
  useEffect(() => {
    if (form.display_name.length >= 3) {
      const prefix = form.display_name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 6);
      const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
      setForm(f => ({ ...f, referral_code: prefix + suffix }));
    }
  }, [form.display_name]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.display_name.trim()) { setError('Display name is required.'); return; }
    if (!form.referral_code.trim()) { setError('Referral code is required.'); return; }
    if (!/^[A-Z0-9]{4,20}$/.test(form.referral_code.trim())) {
      setError('Referral code must be 4–20 uppercase letters and numbers only.');
      return;
    }

    setLoading(true);
    setError('');

    if (isDemo) {
      await new Promise(r => setTimeout(r, 800));
      onAdded({
        id: 'new-' + Date.now(),
        ...form,
        referral_code: form.referral_code.toUpperCase(),
        active: true, is_demo: false,
        created_at: new Date().toISOString(),
        registrations: 0, clicks: 0,
      });
      return;
    }

    const { error: err } = await supabase.from('promoters').insert({
      display_name:    form.display_name.trim(),
      category:        form.category,
      college_or_club: form.college_or_club.trim() || null,
      contact_email:   form.contact_email.trim() || null,
      referral_code:   form.referral_code.trim().toUpperCase(),
    });

    setLoading(false);
    if (err) { setError(err.message); return; }
    onAdded();
  }

  const previewUrl = buildReferralUrl(form.referral_code || 'PREVIEW');

  return (
    <div className="modal-overlay">
      <div className="modal" style={{maxWidth:520}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'var(--space-6)'}}>
          <h2 style={{fontFamily:'var(--font-display)',fontWeight:'var(--fw-bold)',color:'var(--color-navy-900)'}}>
            Add Promoter
          </h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{marginBottom:'var(--space-4)'}}>
            <label className="form-label">Display Name <span className="required">*</span></label>
            <input type="text" className="form-input" placeholder="e.g. Ravi Kumar or CSE Club CBIT"
              value={form.display_name} onChange={e => setForm(f=>({...f,display_name:e.target.value}))} />
          </div>

          <div className="form-group" style={{marginBottom:'var(--space-4)'}}>
            <label className="form-label">Category <span className="required">*</span></label>
            <select className="form-select" value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))}>
              {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{marginBottom:'var(--space-4)'}}>
            <label className="form-label">College / Club (optional)</label>
            <input type="text" className="form-input" placeholder="e.g. IIT Hyderabad"
              value={form.college_or_club} onChange={e => setForm(f=>({...f,college_or_club:e.target.value}))} />
          </div>

          <div className="form-group" style={{marginBottom:'var(--space-4)'}}>
            <label className="form-label">Referral Code <span className="required">*</span></label>
            <input type="text" className="form-input" placeholder="UPPERCASE, 4–20 chars"
              value={form.referral_code}
              onChange={e => setForm(f=>({...f,referral_code:e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'')}))}
            />
            <span className="form-hint">Auto-generated from name. Edit if needed. Must be unique.</span>
          </div>

          {/* Preview URL */}
          <div style={{
            background:'var(--color-gray-50)',border:'1px solid var(--color-gray-200)',
            borderRadius:'var(--radius)',padding:'var(--space-3)',marginBottom:'var(--space-4)',
          }}>
            <div style={{fontSize:'var(--text-xs)',color:'var(--color-gray-500)',marginBottom:4}}>Referral URL preview</div>
            <div style={{fontSize:'var(--text-xs)',fontFamily:'monospace',wordBreak:'break-all',color:'var(--color-navy-800)'}}>
              {previewUrl}
            </div>
          </div>

          {error && (
            <div className="alert alert-error" style={{marginBottom:'var(--space-4)'}} role="alert">
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          <div style={{display:'flex',gap:'var(--space-3)'}}>
            <button type="submit" className="btn btn-primary" style={{flex:1}} disabled={loading} id="add-promoter-submit-btn">
              {loading ? <><span className="spinner" style={{borderTopColor:'white'}} /> Adding…</> : <><Plus size={16} /> Add Promoter</>}
            </button>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────
export default function AdminPromotersPage() {
  const { user } = useAuth();
  const [promoters, setPromoters] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [search,    setSearch]    = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [qrTarget,  setQrTarget]  = useState(null);
  const [addOpen,   setAddOpen]   = useState(false);
  const [copiedId,  setCopiedId]  = useState(null);

  async function loadPromoters() {
    setLoading(true);
    if (isDemo || user?.is_demo_admin) {
      await new Promise(r => setTimeout(r, 400));
      setPromoters(DEMO_PROMOTERS);
      setLoading(false);
      return;
    }
    try {
      const { data, error: err } = await supabase
        .from('promoters')
        .select('*')
        .order('created_at', { ascending: false });
      if (err) throw err;

      // Attach stats
      const { data: eventRows } = await supabase
        .from('referral_events')
        .select('referral_code, event_type');

      const stats = {};
      (eventRows || []).forEach(e => {
        if (!stats[e.referral_code]) stats[e.referral_code] = { clicks: 0, registrations: 0 };
        if (e.event_type === 'click') stats[e.referral_code].clicks++;
        if (e.event_type === 'registration') stats[e.referral_code].registrations++;
      });

      setPromoters((data || []).map(p => ({
        ...p,
        clicks: stats[p.referral_code]?.clicks || 0,
        registrations: stats[p.referral_code]?.registrations || 0,
      })));
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { document.title = 'Promoters — Admin'; loadPromoters(); }, []);

  async function toggleActive(promoter) {
    if (isDemo) {
      setPromoters(ps => ps.map(p => p.id === promoter.id ? { ...p, active: !p.active } : p));
      return;
    }
    await supabase.from('promoters').update({ active: !promoter.active }).eq('id', promoter.id);
    loadPromoters();
  }

  async function handleCopyUrl(code) {
    await copyToClipboard(buildReferralUrl(code));
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleExport() {
    downloadCSV(
      filtered.map(p => flattenPromoterForExport(p, { clicks: p.clicks, registrations: p.registrations })),
      'promoters_export.csv'
    );
  }

  const filtered = promoters.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.display_name.toLowerCase().includes(q) || p.referral_code.toLowerCase().includes(q);
    const matchCat = catFilter === 'all' || p.category === catFilter;
    return matchSearch && matchCat;
  });

  return (
    <AdminLayout title="Promoters">
      {isDemo && (
        <div className="alert alert-info" style={{marginBottom:'var(--space-6)'}}>
          <Info size={16} style={{flexShrink:0}} />
          Demo Mode — changes here are local to this session. Configure Supabase to persist data.
        </div>
      )}

      {/* Toolbar */}
      <div style={{
        display:'flex',flexWrap:'wrap',gap:'var(--space-3)',
        alignItems:'center',justifyContent:'space-between',
        marginBottom:'var(--space-6)',
      }}>
        <div style={{display:'flex',gap:'var(--space-3)',flex:1,flexWrap:'wrap'}}>
          <div style={{position:'relative',flex:1,minWidth:200}}>
            <Search size={16} style={{
              position:'absolute',left:'var(--space-3)',top:'50%',
              transform:'translateY(-50%)',color:'var(--color-gray-400)',
            }} />
            <input
              type="search"
              className="form-input"
              placeholder="Search promoters or codes…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{paddingLeft:'var(--space-10)'}}
              id="promoters-search"
            />
          </div>
          <select
            className="form-select"
            value={catFilter}
            onChange={e => setCatFilter(e.target.value)}
            style={{width:'auto'}}
            id="promoters-cat-filter"
          >
            <option value="all">All categories</option>
            {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        <div style={{display:'flex',gap:'var(--space-3)'}}>
          <button onClick={handleExport} className="btn btn-outline btn-sm" id="promoters-export-btn">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => setAddOpen(true)} className="btn btn-primary btn-sm" id="promoters-add-btn">
            <Plus size={14} /> Add Promoter
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="skeleton" style={{height:300,borderRadius:'var(--radius-lg)'}} />
      ) : error ? (
        <div className="alert alert-error"><AlertTriangle size={16} /> {error}</div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>College / Club</th>
                <th>Code</th>
                <th>Status</th>
                <th>Clicks</th>
                <th>Regs</th>
                <th>Conv.</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} style={{textAlign:'center',padding:'var(--space-8)',color:'var(--color-gray-400)'}}>
                  No promoters found.
                </td></tr>
              ) : filtered.map(p => {
                const conv = p.clicks > 0 ? ((p.registrations / p.clicks) * 100).toFixed(0) + '%' : '—';
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{fontWeight:'var(--fw-medium)',color:'var(--color-navy-900)'}}>{p.display_name}</div>
                      {p.is_demo && <span className="badge badge-demo" style={{marginTop:2}}>DEMO</span>}
                    </td>
                    <td>
                      <span className="badge" style={{
                        background: getCategoryColor(p.category) + '22',
                        color: getCategoryColor(p.category),
                      }}>
                        {getCategoryLabel(p.category)}
                      </span>
                    </td>
                    <td style={{color:'var(--color-gray-500)',fontSize:'var(--text-xs)'}}>
                      {p.college_or_club || '—'}
                    </td>
                    <td>
                      <code style={{
                        fontFamily:'monospace',fontSize:'var(--text-xs)',
                        background:'var(--color-gray-100)',
                        padding:'2px var(--space-2)',
                        borderRadius:'var(--radius-sm)',
                      }}>{p.referral_code}</code>
                    </td>
                    <td>
                      {p.active
                        ? <span className="badge badge-green">Active</span>
                        : <span className="badge badge-gray">Inactive</span>}
                    </td>
                    <td style={{fontWeight:'var(--fw-medium)'}}>{p.clicks}</td>
                    <td style={{fontWeight:'var(--fw-bold)',color:'var(--color-navy-900)'}}>{p.registrations}</td>
                    <td style={{color:'var(--color-gray-500)',fontSize:'var(--text-xs)'}}>{conv}</td>
                    <td>
                      <div style={{display:'flex',gap:'var(--space-2)'}}>
                        <button
                          onClick={() => handleCopyUrl(p.referral_code)}
                          className="btn btn-ghost btn-sm"
                          data-tooltip={copiedId === p.referral_code ? 'Copied!' : 'Copy URL'}
                          id={`copy-url-${p.referral_code}`}
                        >
                          {copiedId === p.referral_code ? <Check size={14} color="var(--color-green-600)" /> : <Copy size={14} />}
                        </button>
                        <button
                          onClick={() => setQrTarget(p)}
                          className="btn btn-ghost btn-sm"
                          data-tooltip="QR Code"
                          id={`qr-${p.referral_code}`}
                        >
                          <QrCode size={14} />
                        </button>
                        <button
                          onClick={() => toggleActive(p)}
                          className="btn btn-ghost btn-sm"
                          data-tooltip={p.active ? 'Deactivate' : 'Activate'}
                          id={`toggle-${p.referral_code}`}
                        >
                          {p.active ? <PowerOff size={14} color="var(--color-red-500)" /> : <Power size={14} color="var(--color-green-600)" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {qrTarget && <QRModal promoter={qrTarget} onClose={() => setQrTarget(null)} />}
      {addOpen && (
        <AddPromoterModal
          onClose={() => setAddOpen(false)}
          onAdded={(newP) => {
            if (newP) setPromoters(ps => [newP, ...ps]);
            else loadPromoters();
            setAddOpen(false);
          }}
        />
      )}
    </AdminLayout>
  );
}
