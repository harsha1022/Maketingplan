import { useState, useEffect } from 'react';
import { Search, Download, Filter, AlertTriangle, Info, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import AdminLayout from '../../components/layout/AdminLayout';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { downloadCSV, flattenRegistrationForExport } from '../../lib/export';

const isDemo = !isSupabaseConfigured;

import { useAuth } from '../../context/AuthContext';

// ── Realistic 3-Day Campaign Student Registrations (Exact 18) ──
const DEMO_REGS = [
  // Day 3 (Today - 8 Registrations)
  { id:'reg-101', full_name:'Aarav Sharma', email:'aarav.sharma@iith.ac.in', college:'IIT Hyderabad', study_year:'Final Year', phone:'+919876543210', attributed_referral_code:'STUDENT001', attribution_source:'student', registration_status:'confirmed', is_demo:true, registered_at:'2026-10-29T10:15:00Z' },
  { id:'reg-102', full_name:'Ananya Iyer', email:'ananya.iyer@vit.ac.in', college:'VIT Vellore', study_year:'Final Year', phone:'+919845012345', attributed_referral_code:'CSECLUB01', attribution_source:'club_convener', registration_status:'confirmed', is_demo:true, registered_at:'2026-10-29T09:40:00Z' },
  { id:'reg-103', full_name:'Rohan Deshmukh', email:'rohan.d@cbit.ac.in', college:'CBIT Hyderabad', study_year:'Final Year', phone:'+919701122334', attributed_referral_code:'CREATOR01', attribution_source:'content_creator', registration_status:'confirmed', is_demo:true, registered_at:'2026-10-29T09:10:00Z' },
  { id:'reg-104', full_name:'Sneha Patel', email:'sneha.patel@nitw.ac.in', college:'NIT Warangal', study_year:'Final Year', phone:'+919618833445', attributed_referral_code:'STUDENT002', attribution_source:'student', registration_status:'confirmed', is_demo:true, registered_at:'2026-10-29T08:35:00Z' },
  { id:'reg-105', full_name:'Vikram Reddy', email:'vikram.reddy@vnrvjiet.in', college:'VNR VJIET Hyderabad', study_year:'Final Year', phone:'+919988776655', attributed_referral_code:'HOSTELQR01', attribution_source:'campus_hostel', registration_status:'confirmed', is_demo:true, registered_at:'2026-10-29T08:00:00Z' },
  { id:'reg-106', full_name:'Pooja Nair', email:'pooja.nair@bits-pilani.ac.in', college:'BITS Pilani Hyderabad', study_year:'Final Year', phone:'+919123456780', attributed_referral_code:'STUDENT001', attribution_source:'student', registration_status:'confirmed', is_demo:true, registered_at:'2026-10-29T07:20:00Z' },
  { id:'reg-107', full_name:'Aditya Verma', email:'aditya.v@srmist.edu.in', college:'SRM University', study_year:'Final Year', phone:'+919501234567', attributed_referral_code:'DEANEMAIL01', attribution_source:'institutional_email', registration_status:'confirmed', is_demo:true, registered_at:'2026-10-29T06:45:00Z' },
  { id:'reg-108', full_name:'Meera Nair', email:'meera.nair@mjcet.ac.in', college:'MJCET Hyderabad', study_year:'Final Year', phone:'+919440112233', attributed_referral_code:'ECELL001', attribution_source:'club_convener', registration_status:'confirmed', is_demo:true, registered_at:'2026-10-29T05:30:00Z' },
  
  // Day 2 (Yesterday - 6 Registrations)
  { id:'reg-201', full_name:'Neha Gupta', email:'neha.gupta@cbit.ac.in', college:'CBIT Hyderabad', study_year:'Final Year', phone:'+919871122334', attributed_referral_code:'CSECLUB01', attribution_source:'club_convener', registration_status:'confirmed', is_demo:true, registered_at:'2026-10-28T21:10:00Z' },
  { id:'reg-202', full_name:'Sai Teja Varma', email:'saiteja.v@jntuh.ac.in', college:'JNTU Hyderabad', study_year:'Final Year', phone:'+919700011222', attributed_referral_code:'STUDENT001', attribution_source:'student', registration_status:'confirmed', is_demo:true, registered_at:'2026-10-28T19:40:00Z' },
  { id:'reg-203', full_name:'Divya Krishnan', email:'divya.k@vit.ac.in', college:'VIT Vellore', study_year:'Final Year', phone:'+919444123456', attributed_referral_code:'IEEE001', attribution_source:'club_convener', registration_status:'confirmed', is_demo:true, registered_at:'2026-10-28T18:25:00Z' },
  { id:'reg-204', full_name:'Rahul Choudhary', email:'rahul.c@nitw.ac.in', college:'NIT Warangal', study_year:'Final Year', phone:'+919989012345', attributed_referral_code:'CREATOR01', attribution_source:'content_creator', registration_status:'confirmed', is_demo:true, registered_at:'2026-10-28T16:50:00Z' },
  { id:'reg-205', full_name:'Priya Sharma', email:'priya.s@vasavi.ac.in', college:'Vasavi College of Engg', study_year:'Final Year', phone:'+919848098765', attributed_referral_code:'STUDENT002', attribution_source:'student', registration_status:'confirmed', is_demo:true, registered_at:'2026-10-28T15:15:00Z' },
  { id:'reg-206', full_name:'Ashwin Sundaram', email:'ashwin.s@iitm.ac.in', college:'IIT Madras', study_year:'Final Year', phone:'+919840123456', attributed_referral_code:'STUDENT003', attribution_source:'student', registration_status:'confirmed', is_demo:true, registered_at:'2026-10-28T14:00:00Z' },

  // Day 1 (Launch Day - 4 Registrations)
  { id:'reg-301', full_name:'Tanvi Deshmukh', email:'tanvi.d@iith.ac.in', college:'IIT Hyderabad', study_year:'Final Year', phone:'+919822123456', attributed_referral_code:'STUDENT004', attribution_source:'student', registration_status:'confirmed', is_demo:true, registered_at:'2026-10-27T18:30:00Z' },
  { id:'reg-302', full_name:'Varun Kapoor', email:'varun.k@cbit.ac.in', college:'CBIT Hyderabad', study_year:'Final Year', phone:'+919811122334', attributed_referral_code:'IEEE001', attribution_source:'club_convener', registration_status:'confirmed', is_demo:true, registered_at:'2026-10-27T17:15:00Z' },
  { id:'reg-303', full_name:'Shreya Bose', email:'shreya.bose@bits-hyderabad.ac.in', college:'BITS Pilani Hyderabad', study_year:'Final Year', phone:'+919830112233', attributed_referral_code:'CREATOR02', attribution_source:'content_creator', registration_status:'confirmed', is_demo:true, registered_at:'2026-10-27T13:20:00Z' },
  { id:'reg-304', full_name:'Karthik Subramanian', email:'karthik.sub@iitb.ac.in', college:'IIT Bombay', study_year:'Final Year', phone:'+919820011223', attributed_referral_code:null, attribution_source:'direct', registration_status:'confirmed', is_demo:true, registered_at:'2026-10-27T10:30:00Z' },
];

const SOURCE_LABELS = {
  student:              'Student',
  club_convener:        'Club',
  content_creator:      'Creator',
  campus_hostel:        'Hostel',
  institutional_email:  'Email',
  direct:               'Direct',
};

const SOURCE_COLORS = {
  student:              'badge-blue',
  club_convener:        'badge-violet',
  content_creator:      'badge-amber',
  campus_hostel:        'badge-green',
  institutional_email:  'badge-red',
  direct:               'badge-gray',
};

export default function AdminRegistrationsPage() {
  const { user } = useAuth();
  const [regs,      setRegs]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [search,    setSearch]    = useState('');
  const [srcFilter, setSrcFilter] = useState('all');
  const [page,      setPage]      = useState(1);
  const PAGE_SIZE = 25;

  async function loadRegs() {
    setLoading(true);
    if (isDemo || user?.is_demo_admin) {
      await new Promise(r => setTimeout(r, 400));
      setRegs(DEMO_REGS);
      setLoading(false);
      return;
    }
    try {
      const { data, error: err } = await supabase
        .from('registrations')
        .select('*')
        .order('registered_at', { ascending: false })
        .limit(500);
      if (err) throw err;
      setRegs((data && data.length > 0) ? data : DEMO_REGS);
    } catch (e) {
      setRegs(DEMO_REGS);
    }
    finally { setLoading(false); }
  }

  useEffect(() => { document.title = 'Registrations — Admin'; loadRegs(); }, []);

  const filtered = regs.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      r.full_name?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.college?.toLowerCase().includes(q) ||
      r.attributed_referral_code?.toLowerCase().includes(q);
    const matchSrc = srcFilter === 'all' || r.attribution_source === srcFilter;
    return matchSearch && matchSrc;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleExport() {
    downloadCSV(filtered.map(flattenRegistrationForExport), 'registrations_export.csv');
  }

  return (
    <AdminLayout title="Registrations">
      {isDemo && (
        <div className="alert alert-info" style={{marginBottom:'var(--space-6)'}}>
          <Info size={16} style={{flexShrink:0}} />
          Demo Mode — showing sample registrations. Real data requires Supabase configuration.
        </div>
      )}

      {/* Stats bar */}
      <div style={{
        display:'grid',
        gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',
        gap:'var(--space-4)',
        marginBottom:'var(--space-6)',
      }}>
        {[
          { label: 'Total', value: regs.filter(r => r.registration_status === 'confirmed').length },
          { label: 'Showing', value: filtered.length },
          { label: 'Demo records', value: regs.filter(r => r.is_demo).length },
          { label: 'Real records', value: regs.filter(r => !r.is_demo && r.registration_status === 'confirmed').length },
        ].map((s, i) => (
          <div key={i} className="card" style={{padding:'var(--space-4)',textAlign:'center'}}>
            <div style={{fontSize:'var(--text-2xl)',fontWeight:'var(--fw-bold)',fontFamily:'var(--font-display)',color:'var(--color-navy-900)'}}>{s.value}</div>
            <div style={{fontSize:'var(--text-xs)',color:'var(--color-gray-500)',marginTop:2}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{display:'flex',flexWrap:'wrap',gap:'var(--space-3)',marginBottom:'var(--space-4)',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',gap:'var(--space-3)',flex:1,flexWrap:'wrap'}}>
          <div style={{position:'relative',flex:1,minWidth:200}}>
            <Search size={16} style={{position:'absolute',left:'var(--space-3)',top:'50%',transform:'translateY(-50%)',color:'var(--color-gray-400)'}} />
            <input type="search" className="form-input" placeholder="Search by name, email, college…"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{paddingLeft:'var(--space-10)'}} id="regs-search" />
          </div>
          <select className="form-select" value={srcFilter}
            onChange={e => { setSrcFilter(e.target.value); setPage(1); }} style={{width:'auto'}} id="regs-filter">
            <option value="all">All channels</option>
            {Object.entries(SOURCE_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
          </select>
        </div>
        <div style={{display:'flex',gap:'var(--space-3)'}}>
          <button onClick={loadRegs} className="btn btn-ghost btn-sm" disabled={loading}><RefreshCw size={14} /></button>
          <button onClick={handleExport} className="btn btn-outline btn-sm" id="regs-export-btn">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="skeleton" style={{height:300,borderRadius:'var(--radius-lg)'}} />
      ) : error ? (
        <div className="alert alert-error"><AlertTriangle size={16} /> {error}</div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>College</th>
                  <th>Year</th>
                  <th>Channel</th>
                  <th>Referral Code</th>
                  <th>Status</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={8} style={{textAlign:'center',padding:'var(--space-8)',color:'var(--color-gray-400)'}}>No registrations match your search.</td></tr>
                ) : paginated.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div style={{fontWeight:'var(--fw-medium)',color:'var(--color-navy-900)'}}>{r.full_name}</div>
                      {r.is_demo && <span className="badge badge-demo">DEMO</span>}
                    </td>
                    <td style={{fontSize:'var(--text-xs)',color:'var(--color-gray-600)'}}>{r.email}</td>
                    <td style={{fontSize:'var(--text-xs)',color:'var(--color-gray-500)'}}>{r.college}</td>
                    <td style={{fontSize:'var(--text-xs)'}}>{r.study_year}</td>
                    <td>
                      <span className={`badge ${SOURCE_COLORS[r.attribution_source] || 'badge-gray'}`}>
                        {SOURCE_LABELS[r.attribution_source] || r.attribution_source}
                      </span>
                    </td>
                    <td>
                      {r.attributed_referral_code
                        ? <code style={{fontSize:'var(--text-xs)',background:'var(--color-gray-100)',padding:'2px 6px',borderRadius:'4px'}}>{r.attributed_referral_code}</code>
                        : <span style={{color:'var(--color-gray-400)',fontSize:'var(--text-xs)'}}>—</span>}
                    </td>
                    <td>
                      <span className={`badge ${r.registration_status === 'confirmed' ? 'badge-green' : 'badge-gray'}`}>
                        {r.registration_status}
                      </span>
                    </td>
                    <td style={{fontSize:'var(--text-xs)',color:'var(--color-gray-500)',whiteSpace:'nowrap'}}>
                      {r.registered_at ? format(new Date(r.registered_at), 'MMM d, HH:mm') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'var(--space-3)',marginTop:'var(--space-4)'}}>
              <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <span style={{fontSize:'var(--text-sm)',color:'var(--color-gray-500)'}}>Page {page} of {totalPages}</span>
              <button className="btn btn-outline btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
