import { useEffect, useState } from 'react';
import { format, subDays, startOfDay } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Users, TrendingUp, Link2, MousePointerClick, Activity,
  Target, RefreshCw, AlertTriangle, Download, Info,
} from 'lucide-react';

import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { downloadCSV, flattenRegistrationForExport } from '../../lib/export';

// ── 3-Day Active Campaign Data (Exact Match: 18 Registrations) ──
const DEMO_METRICS = {
  totalRegistrations: 18,
  todayRegistrations: 8,
  totalTarget: 500,
  activeReferralCodes: 11,
  totalClicks: 46,
  byChannel: [
    { channel: 'student',             count: 7 },
    { channel: 'club_convener',       count: 5 },
    { channel: 'content_creator',     count: 3 },
    { channel: 'campus_hostel',       count: 1 },
    { channel: 'institutional_email',  count: 1 },
    { channel: 'direct',              count: 1 },
  ],
};

const CHANNEL_COLORS = {
  student:              '#2563EB',
  club_convener:        '#7C3AED',
  content_creator:      '#D97706',
  campus_hostel:        '#059669',
  institutional_email:  '#DC2626',
  direct:               '#6B7280',
};

const CHANNEL_LABELS = {
  student:              'Student Ambassadors',
  club_convener:        'Club Conveners',
  content_creator:      'Content Creators',
  campus_hostel:        'Campus / Hostel',
  institutional_email:  'Institutional Email',
  direct:               'Direct / Unknown',
};

// ── Metric card ────────────────────────────────────────────────
function MetricCard({ icon, label, value, sub, color, bg }) {
  return (
    <div className="metric-card">
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
        <div>
          <div className="metric-card-label">{label}</div>
          <div className="metric-card-value">{value}</div>
          {sub && <div style={{fontSize:'var(--text-xs)',color:'var(--color-gray-400)',marginTop:'var(--space-1)'}}>{sub}</div>}
        </div>
        <div className="metric-card-icon" style={{background: bg || 'var(--color-gray-100)', color: color || 'var(--color-gray-600)', flexShrink:0}}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ── Progress toward target ─────────────────────────────────────
function ProgressCard({ current, target }) {
  const pct = Math.min((current / target) * 100, 100).toFixed(1);
  const remaining = Math.max(target - current, 0);
  return (
    <div className="card" style={{gridColumn:'span 2'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:'var(--space-3)'}}>
        <div>
          <div className="metric-card-label">Campaign Progress</div>
          <div style={{
            fontFamily:'var(--font-display)',
            fontSize:'var(--text-2xl)',
            fontWeight:'var(--fw-bold)',
            color:'var(--color-navy-900)',
          }}>
            {current} / {target}
          </div>
        </div>
        <div style={{textAlign:'right'}}>
          <span style={{
            fontSize:'var(--text-3xl)',
            fontWeight:'var(--fw-bold)',
            fontFamily:'var(--font-display)',
            color: pct >= 100 ? 'var(--color-green-600)' : 'var(--color-navy-800)',
          }}>{pct}%</span>
        </div>
      </div>
      <div className="progress-bar-wrapper">
        <div className="progress-bar-fill" style={{width:`${pct}%`}} />
      </div>
      <div style={{fontSize:'var(--text-xs)',color:'var(--color-gray-500)',marginTop:'var(--space-2)'}}>
        {remaining > 0
          ? `${remaining} more registrations needed to reach the target of ${target}`
          : '🎉 Campaign target reached!'}
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics]   = useState(null);
  const [trend,   setTrend]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState(null);
  const [regs,    setRegs]      = useState([]);
  const isDemo = !isSupabaseConfigured;

  async function loadMetrics() {
    setLoading(true);
    setError(null);

    if (isDemo || user?.is_demo_admin) {
      await new Promise(r => setTimeout(r, 400));
      setMetrics(DEMO_METRICS);
      // Generate 3-day active campaign trend (Day 1: 4, Day 2: 6, Day 3: 8 -> Total: 18)
      const today = new Date();
      setTrend(Array.from({ length: 7 }, (_, i) => ({
        day: format(subDays(today, 6 - i), 'MMM d'),
        count: [0, 0, 0, 0, 4, 6, 8][i],
      })));
      setLoading(false);
      return;
    }

    try {
      // Real Supabase queries
      const today = startOfDay(new Date()).toISOString();

      const [{ count: total }, { count: todayCount }, { data: settings }, { data: byChannel }, { data: clicks }] =
        await Promise.all([
          supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('registration_status', 'confirmed').eq('is_demo', false),
          supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('registration_status', 'confirmed').eq('is_demo', false).gte('registered_at', today),
          supabase.from('campaign_settings').select('target_registrations').single(),
          supabase.from('registrations').select('attribution_source').eq('registration_status', 'confirmed').eq('is_demo', false),
          supabase.from('referral_events').select('event_type').eq('event_type', 'click').eq('is_demo', false),
        ]);

      // Aggregate by channel
      const channelCounts = {};
      (byChannel || []).forEach(r => {
        const ch = r.attribution_source || 'direct';
        channelCounts[ch] = (channelCounts[ch] || 0) + 1;
      });

      // 7-day trend
      const { data: trendRows } = await supabase
        .from('registrations')
        .select('registered_at')
        .eq('registration_status', 'confirmed')
        .eq('is_demo', false)
        .gte('registered_at', subDays(new Date(), 7).toISOString());

      const trendMap = {};
      (trendRows || []).forEach(r => {
        const day = format(new Date(r.registered_at), 'MMM d');
        trendMap[day] = (trendMap[day] || 0) + 1;
      });

      const trendData = Array.from({ length: 7 }, (_, i) => {
        const d = subDays(new Date(), 6 - i);
        const day = format(d, 'MMM d');
        return { day, count: trendMap[day] || 0 };
      });

      // Active promoters
      const { count: activePromoters } = await supabase
        .from('promoters')
        .select('*', { count: 'exact', head: true })
        .eq('active', true)
        .eq('is_demo', false);

      setMetrics({
        totalRegistrations: total || 0,
        todayRegistrations: todayCount || 0,
        totalTarget: settings?.target_registrations || 500,
        activeReferralCodes: activePromoters || 0,
        totalClicks: (clicks || []).length,
        byChannel: Object.entries(channelCounts).map(([channel, count]) => ({ channel, count })),
      });
      setTrend(trendData);

      // Load recent regs for export
      const { data: recentRegs } = await supabase
        .from('registrations')
        .select('*')
        .order('registered_at', { ascending: false })
        .limit(200);
      setRegs(recentRegs || []);

    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadMetrics(); }, []);

  const conversionRate = metrics?.totalClicks > 0
    ? ((metrics.totalRegistrations / metrics.totalClicks) * 100).toFixed(1)
    : '0.0';

  function handleExport() {
    if (isDemo) {
      alert('Demo Mode: CSV export requires Supabase to be configured.');
      return;
    }
    downloadCSV(regs.map(flattenRegistrationForExport), 'registrations_export.csv');
  }

  const pieData = (metrics?.byChannel || []).map(b => ({
    name: CHANNEL_LABELS[b.channel] || b.channel,
    value: b.count,
    color: CHANNEL_COLORS[b.channel] || '#6B7280',
  }));

  return (
    <AdminLayout title="Dashboard">
      {/* Demo notice */}
      {isDemo && (
        <div className="alert alert-warning" style={{marginBottom:'var(--space-6)'}}>
          <Info size={16} style={{flexShrink:0}} />
          <div>
            <strong>Demo Mode</strong> — All metrics shown are from simulated demo data.
            Configure Supabase for real campaign analytics.
          </div>
        </div>
      )}

      {/* Actions row */}
      <div style={{display:'flex',justifyContent:'flex-end',gap:'var(--space-3)',marginBottom:'var(--space-6)'}}>
        <button onClick={loadMetrics} className="btn btn-outline btn-sm" disabled={loading} id="dashboard-refresh-btn">
          <RefreshCw size={14} /> Refresh
        </button>
        <button onClick={handleExport} className="btn btn-outline btn-sm" id="dashboard-export-btn">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{marginBottom:'var(--space-6)'}}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {loading && !metrics ? (
        <div>
          <div className="metrics-grid" style={{marginBottom:'var(--space-6)'}}>
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{height:110,borderRadius:'var(--radius-lg)'}} />)}
          </div>
        </div>
      ) : metrics && (
        <>
          {/* Metric cards */}
          <div className="metrics-grid" style={{marginBottom:'var(--space-6)'}}>
            <MetricCard
              icon={<Users size={20} />}
              label="Total Registrations"
              value={metrics.totalRegistrations.toLocaleString()}
              sub={`${metrics.todayRegistrations} today`}
              color="#2563EB" bg="#EFF6FF"
            />
            <MetricCard
              icon={<Target size={20} />}
              label="Target"
              value={`${metrics.totalTarget}`}
              sub={`${Math.max(metrics.totalTarget - metrics.totalRegistrations, 0)} remaining`}
              color="#16A34A" bg="#F0FDF4"
            />
            <MetricCard
              icon={<TrendingUp size={20} />}
              label="Today's Registrations"
              value={metrics.todayRegistrations}
              color="#7C3AED" bg="#EDE9FE"
            />
            <MetricCard
              icon={<Link2 size={20} />}
              label="Active Referral Codes"
              value={metrics.activeReferralCodes}
              color="#D97706" bg="#FFFBEB"
            />
            <MetricCard
              icon={<MousePointerClick size={20} />}
              label="Referral Clicks"
              value={metrics.totalClicks.toLocaleString()}
              color="#DC2626" bg="#FEF2F2"
            />
            <MetricCard
              icon={<Activity size={20} />}
              label="Click-to-Registration Rate"
              value={`${conversionRate}%`}
              sub="Referral clicks → confirmed registrations"
              color="#059669" bg="#F0FDF4"
            />
          </div>

          {/* Progress bar card */}
          <div className="metrics-grid" style={{marginBottom:'var(--space-6)'}}>
            <ProgressCard current={metrics.totalRegistrations} target={metrics.totalTarget} />
          </div>

          {/* Charts */}
          <div className="charts-grid" style={{marginBottom:'var(--space-6)'}}>
            {/* 7-day trend */}
            <div className="card">
              <div style={{fontFamily:'var(--font-display)',fontWeight:'var(--fw-semibold)',marginBottom:'var(--space-4)',color:'var(--color-navy-900)'}}>
                7-Day Registration Trend
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={trend} margin={{top:4,right:4,left:-16,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="day" tick={{fontSize:11,fill:'#94A3B8'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize:11,fill:'#94A3B8'}} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{borderRadius:'var(--radius)',border:'1px solid var(--color-gray-200)',fontSize:12}}
                    cursor={{fill:'var(--color-gray-50)'}}
                  />
                  <Bar dataKey="count" name="Registrations" fill="#2563EB" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Channel breakdown pie */}
            <div className="card">
              <div style={{fontFamily:'var(--font-display)',fontWeight:'var(--fw-semibold)',marginBottom:'var(--space-4)',color:'var(--color-navy-900)'}}>
                Registrations by Channel
              </div>
              {pieData.length === 0 ? (
                <div style={{textAlign:'center',padding:'var(--space-8)',color:'var(--color-gray-400)',fontSize:'var(--text-sm)'}}>No data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius:'var(--radius)',border:'1px solid var(--color-gray-200)',fontSize:12}} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:11}} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Channel table */}
          <div className="card">
            <div style={{fontFamily:'var(--font-display)',fontWeight:'var(--fw-semibold)',marginBottom:'var(--space-4)',color:'var(--color-navy-900)'}}>
              Channel Performance
            </div>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Channel</th>
                    <th>Registrations</th>
                    <th>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.byChannel
                    .sort((a,b) => b.count - a.count)
                    .map((row, i) => {
                      const share = metrics.totalRegistrations > 0
                        ? ((row.count / metrics.totalRegistrations) * 100).toFixed(1)
                        : '0.0';
                      return (
                        <tr key={i}>
                          <td>
                            <div style={{display:'flex',alignItems:'center',gap:'var(--space-2)'}}>
                              <div style={{
                                width:10,height:10,
                                borderRadius:'50%',
                                background: CHANNEL_COLORS[row.channel] || '#6B7280',
                                flexShrink:0,
                              }} />
                              {CHANNEL_LABELS[row.channel] || row.channel}
                            </div>
                          </td>
                          <td style={{fontWeight:'var(--fw-semibold)'}}>{row.count}</td>
                          <td>
                            <div style={{display:'flex',alignItems:'center',gap:'var(--space-3)'}}>
                              <div className="progress-bar-wrapper" style={{flex:1,height:6}}>
                                <div className="progress-bar-fill" style={{
                                  width:`${share}%`,
                                  background: CHANNEL_COLORS[row.channel] || 'var(--color-green-500)',
                                }} />
                              </div>
                              <span style={{fontSize:'var(--text-xs)',color:'var(--color-gray-500)',minWidth:36,textAlign:'right'}}>
                                {share}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
