import { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Users, Megaphone, Star, Info, Lock, RefreshCw } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// ── 3-Day Active Campaign Leaderboard Data (Exact 18 Total) ──────
const DEMO_LEADERBOARDS = {
  student: [
    { rank: 1, display_name: 'Arjun Sharma', college_or_club: 'IIT Hyderabad', registrations: 3, is_demo: true },
    { rank: 2, display_name: 'Priya Nair',   college_or_club: 'NIT Warangal',  registrations: 2, is_demo: true },
    { rank: 3, display_name: 'Rahul Verma',  college_or_club: 'BITS Pilani',   registrations: 1, is_demo: true },
    { rank: 4, display_name: 'Sneha Patel',  college_or_club: 'VNR VJIET',     registrations: 1, is_demo: true },
  ],
  club_convener: [
    { rank: 1, display_name: 'CSE Club — CBIT',            college_or_club: 'CBIT Hyderabad', registrations: 2, is_demo: true },
    { rank: 2, display_name: 'IEEE Student Chapter — VIT', college_or_club: 'VIT Vellore',    registrations: 2, is_demo: true },
    { rank: 3, display_name: 'E-Cell MJCET',                college_or_club: 'MJCET Hyderabad', registrations: 1, is_demo: true },
  ],
  content_creator: [
    { rank: 1, display_name: 'TechWithRiya (YouTube)',    college_or_club: null, registrations: 2, is_demo: true },
    { rank: 2, display_name: 'CodeWithSam (Instagram)',   college_or_club: null, registrations: 1, is_demo: true },
  ],
};

// ── Medal component ────────────────────────────────────────────
function RankMedal({ rank }) {
  if (rank === 1) return <Crown size={22} color="#F59E0B" />;
  if (rank === 2) return <Medal size={22} color="#9CA3AF" />;
  if (rank === 3) return <Medal size={22} color="#B45309" />;
  return <span style={{fontWeight:'bold',color:'var(--color-gray-400)',minWidth:22,textAlign:'center'}}>{rank}</span>;
}

// ── Single leaderboard panel ───────────────────────────────────
function LeaderboardPanel({ title, icon, entries, prizeText, prizeCount, color, bg }) {
  return (
    <div className="card" style={{padding:0,overflow:'hidden'}}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${color}, ${color}dd)`,
        padding: 'var(--space-6)',
        color: 'white',
      }}>
        <div style={{display:'flex',alignItems:'center',gap:'var(--space-3)',marginBottom:'var(--space-2)'}}>
          {icon}
          <h2 style={{
            fontFamily:'var(--font-display)',
            fontSize:'var(--text-xl)',
            fontWeight:'var(--fw-bold)',
            color:'white',
          }}>{title}</h2>
        </div>
        <div style={{
          display:'inline-flex',
          alignItems:'center',
          gap:'var(--space-2)',
          background:'rgba(255,255,255,0.15)',
          borderRadius:'var(--radius-full)',
          padding:'2px var(--space-3)',
          fontSize:'var(--text-xs)',
          fontWeight:'var(--fw-semibold)',
        }}>
          <Trophy size={12} />
          {prizeText}
        </div>
      </div>

      {/* Rows */}
      <div style={{padding:'var(--space-4)'}}>
        {entries.length === 0 ? (
          <div style={{
            textAlign:'center',
            padding:'var(--space-8)',
            color:'var(--color-gray-400)',
            fontSize:'var(--text-sm)',
          }}>
            No entries yet. Be the first to refer!
          </div>
        ) : (
          entries.map((entry, i) => (
            <div
              key={i}
              className="leaderboard-row"
              style={{
                background: i < prizeCount ? bg : 'transparent',
                borderRadius:'var(--radius)',
                marginBottom:'var(--space-2)',
              }}
            >
              {/* Rank */}
              <div style={{display:'flex',alignItems:'center',justifyContent:'center',width:32}}>
                <RankMedal rank={entry.rank} />
              </div>

              {/* Info */}
              <div style={{flex:1,minWidth:0}}>
                <div style={{
                  fontWeight:'var(--fw-semibold)',
                  color:'var(--color-navy-900)',
                  fontSize:'var(--text-sm)',
                  display:'flex',
                  alignItems:'center',
                  gap:'var(--space-2)',
                }}>
                  <span className="truncate">{entry.display_name}</span>
                  {entry.is_demo && <span className="badge badge-demo">DEMO</span>}
                  {i < prizeCount && (
                    <span className="badge badge-amber">Prize eligible</span>
                  )}
                </div>
                {entry.college_or_club && (
                  <div style={{fontSize:'var(--text-xs)',color:'var(--color-gray-500)',marginTop:2}}>
                    {entry.college_or_club}
                  </div>
                )}
              </div>

              {/* Count */}
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{
                  fontFamily:'var(--font-display)',
                  fontSize:'var(--text-xl)',
                  fontWeight:'var(--fw-bold)',
                  color: i < prizeCount ? color : 'var(--color-gray-600)',
                }}>
                  {entry.registrations}
                </div>
                <div style={{fontSize:'var(--text-xs)',color:'var(--color-gray-400)'}}>referrals</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Rules note */}
      <div style={{
        borderTop:'1px solid var(--color-gray-100)',
        padding:'var(--space-4) var(--space-6)',
        fontSize:'var(--text-xs)',
        color:'var(--color-gray-500)',
      }}>
        Prizes subject to published competition rules. Only verified unique registrations count.
        Tie-breaker: time at which tied count was reached.
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────
export default function LeaderboardPage() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [campaignStatus, setCampaignStatus] = useState('active');
  const [lastUpdated, setLastUpdated] = useState(null);

  async function loadData() {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured || !supabase) {
      // Demo mode
      await new Promise(r => setTimeout(r, 600));
      setData(DEMO_LEADERBOARDS);
      setCampaignStatus('active');
      setLastUpdated(new Date());
      setLoading(false);
      return;
    }

    try {
      // Fetch campaign settings
      const { data: campaign } = await supabase
        .from('campaign_settings')
        .select('status')
        .single();

      if (campaign) setCampaignStatus(campaign.status);

      // Build leaderboard from registrations grouped by promoter
      const { data: rows, error: err } = await supabase
        .from('registrations')
        .select(`
          attributed_promoter_id,
          promoters(id, display_name, category, college_or_club, is_demo)
        `)
        .eq('registration_status', 'confirmed')
        .not('attributed_promoter_id', 'is', null);

      if (err || !rows || rows.length === 0) {
        setData(DEMO_LEADERBOARDS);
        setLastUpdated(new Date());
        setLoading(false);
        return;
      }

      // Aggregate
      const counts = {};
      rows.forEach(row => {
        const p = row.promoters;
        if (!p) return;
        if (!counts[p.id]) {
          counts[p.id] = {
            id: p.id,
            display_name: p.display_name,
            category: p.category,
            college_or_club: p.college_or_club,
            is_demo: p.is_demo,
            registrations: 0,
          };
        }
        counts[p.id].registrations++;
      });

      const all = Object.values(counts).sort((a, b) => b.registrations - a.registrations);

      const byCategory = { student: [], club_convener: [], content_creator: [] };
      all.forEach(p => {
        if (byCategory[p.category]) byCategory[p.category].push(p);
      });

      // Add rank
      Object.values(byCategory).forEach(list => {
        list.forEach((entry, i) => { entry.rank = i + 1; });
      });

      setData(byCategory);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    document.title = 'Leaderboard — Campus Growth';
    loadData();
  }, []);

  return (
    <>
      <Navbar />

      {/* Header */}
      <section style={{
        background: 'linear-gradient(160deg, var(--color-navy-900), var(--color-navy-700))',
        color: 'white',
        padding: 'var(--space-16) 0 var(--space-12)',
        textAlign: 'center',
      }}>
        <div className="container">
          <div style={{
            display:'inline-flex',alignItems:'center',justifyContent:'center',
            width:72,height:72,
            background:'rgba(245,158,11,0.15)',
            borderRadius:'50%',
            marginBottom:'var(--space-6)',
          }}>
            <Trophy size={32} color="#F59E0B" />
          </div>
          <h1 style={{
            fontFamily:'var(--font-display)',
            fontSize:'var(--text-4xl)',
            fontWeight:'var(--fw-extrabold)',
            marginBottom:'var(--space-4)',
          }}>
            Referral Leaderboard
          </h1>
          <p style={{fontSize:'var(--text-lg)',color:'rgba(255,255,255,0.7)',maxWidth:560,margin:'0 auto var(--space-6)'}}>
            Top referrers across three categories win goodies worth ₹200 each.
            Rankings update in real time based on verified unique registrations.
          </p>

          {campaignStatus === 'closed' && (
            <div style={{
              display:'inline-flex',alignItems:'center',gap:'var(--space-2)',
              background:'rgba(245,158,11,0.2)',
              border:'1px solid rgba(245,158,11,0.4)',
              borderRadius:'var(--radius-full)',
              padding:'var(--space-2) var(--space-5)',
              fontSize:'var(--text-sm)',
              fontWeight:'var(--fw-semibold)',
              color:'#FCD34D',
            }}>
              <Lock size={14} />
              Campaign Closed — Final Standings
            </div>
          )}
        </div>
      </section>

      <main style={{background:'var(--color-gray-50)',padding:'var(--space-12) 0'}}>
        <div className="container">

          {/* Demo notice */}
          {!isSupabaseConfigured && (
            <div className="alert alert-info" style={{marginBottom:'var(--space-6)'}}>
              <Info size={16} style={{flexShrink:0}} />
              <div>
                <strong>Demo Mode</strong> — Showing sample leaderboard data.
                All entries marked <span className="badge badge-demo" style={{display:'inline-flex',marginLeft:4}}>DEMO</span> are
                simulated and do not represent real students.
              </div>
            </div>
          )}

          {/* Refresh + timestamp */}
          <div style={{
            display:'flex',alignItems:'center',justifyContent:'space-between',
            marginBottom:'var(--space-6)',
            flexWrap:'wrap',
            gap:'var(--space-3)',
          }}>
            <div style={{fontSize:'var(--text-sm)',color:'var(--color-gray-500)'}}>
              {lastUpdated && `Updated ${lastUpdated.toLocaleTimeString()}`}
            </div>
            <button
              onClick={loadData}
              className="btn btn-outline btn-sm"
              disabled={loading}
              id="leaderboard-refresh-btn"
            >
              <RefreshCw size={14} className={loading ? 'spinner' : ''} />
              {loading ? 'Loading…' : 'Refresh'}
            </button>
          </div>

          {error && (
            <div className="alert alert-error" style={{marginBottom:'var(--space-6)'}}>
              Failed to load leaderboard: {error}
            </div>
          )}

          {loading && !data ? (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'var(--space-6)'}}>
              {[1,2,3].map(i => (
                <div key={i} className="card" style={{height:320}}>
                  <div className="skeleton" style={{height:80,borderRadius:'var(--radius)'}} />
                  <div style={{padding:'var(--space-4)',display:'flex',flexDirection:'column',gap:'var(--space-3)'}}>
                    {[1,2,3].map(j => <div key={j} className="skeleton" style={{height:48,borderRadius:'var(--radius)'}} />)}
                  </div>
                </div>
              ))}
            </div>
          ) : data && (
            <div style={{
              display:'grid',
              gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',
              gap:'var(--space-6)',
            }}>
              <LeaderboardPanel
                title="Student Ambassadors"
                icon={<Users size={22} color="white" />}
                entries={data.student || []}
                prizeText="Top 3 win ₹200 each"
                prizeCount={3}
                color="#2563EB"
                bg="var(--color-blue-50)"
              />
              <LeaderboardPanel
                title="Club Conveners"
                icon={<Star size={22} color="white" />}
                entries={data.club_convener || []}
                prizeText="Top 3 win ₹200 each"
                prizeCount={3}
                color="#7C3AED"
                bg="#EDE9FE"
              />
              <LeaderboardPanel
                title="Content Creators"
                icon={<Megaphone size={22} color="white" />}
                entries={data.content_creator || []}
                prizeText="Top 2 win ₹200 each"
                prizeCount={2}
                color="#D97706"
                bg="var(--color-amber-50)"
              />
            </div>
          )}

          {/* Budget breakdown */}
          <div className="card" style={{marginTop:'var(--space-8)'}}>
            <h2 style={{
              fontFamily:'var(--font-display)',
              fontSize:'var(--text-lg)',
              fontWeight:'var(--fw-bold)',
              marginBottom:'var(--space-4)',
              color:'var(--color-navy-900)',
            }}>
              Campaign Budget Breakdown
            </h2>
            <div style={{
              display:'grid',
              gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',
              gap:'var(--space-4)',
            }}>
              {[
                { label: 'Student prizes (top 3 × ₹200)', value: '₹600' },
                { label: 'Club prizes (top 3 × ₹200)',    value: '₹600' },
                { label: 'Creator prizes (top 2 × ₹200)', value: '₹400' },
                { label: 'Hostel posters & QR printing',  value: '₹200' },
                { label: 'Contingency buffer',            value: '₹200' },
              ].map((row, i) => (
                <div key={i} style={{
                  padding:'var(--space-4)',
                  background:'var(--color-gray-50)',
                  borderRadius:'var(--radius)',
                  display:'flex',
                  justifyContent:'space-between',
                  alignItems:'center',
                  gap:'var(--space-4)',
                }}>
                  <span style={{fontSize:'var(--text-sm)',color:'var(--color-gray-600)'}}>{row.label}</span>
                  <span style={{fontWeight:'var(--fw-bold)',color:'var(--color-navy-800)',flexShrink:0}}>{row.value}</span>
                </div>
              ))}
              <div style={{
                padding:'var(--space-4)',
                background:'var(--color-navy-900)',
                borderRadius:'var(--radius)',
                display:'flex',
                justifyContent:'space-between',
                alignItems:'center',
                gap:'var(--space-4)',
              }}>
                <span style={{fontSize:'var(--text-sm)',color:'rgba(255,255,255,0.7)',fontWeight:'var(--fw-semibold)'}}>Total Campaign Budget</span>
                <span style={{fontWeight:'var(--fw-bold)',color:'white',flexShrink:0,fontSize:'var(--text-lg)'}}>₹2,000</span>
              </div>
            </div>
            <p style={{
              fontSize:'var(--text-xs)',
              color:'var(--color-gray-500)',
              marginTop:'var(--space-4)',
              lineHeight:1.6,
            }}>
              All prizes are subject to competition rules and are contingent on the campaign meeting
              its registration target. Prizes are per eligible winner, not per category total.
              A promoter who qualifies in multiple categories will be assigned to their primary
              registered category only, and will not receive duplicate prizes.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
