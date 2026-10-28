import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock, Monitor, Users, ChevronDown, ChevronUp,
  CheckCircle, Share2, Trophy, ArrowRight,
  Code2, Brain, Rocket, Star, BookOpen, GraduationCap
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

// ── Hero Illustration ──────────────────────────────────────────
function HeroIllustration() {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      maxWidth: 480,
      margin: '0 auto',
    }}>
      {/* Main code card */}
      <div style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-6)',
        backdropFilter: 'blur(8px)',
      }}>
        <div style={{display:'flex',alignItems:'center',gap:'var(--space-2)',marginBottom:'var(--space-4)'}}>
          <div style={{width:12,height:12,borderRadius:'50%',background:'#FF5F57'}} />
          <div style={{width:12,height:12,borderRadius:'50%',background:'#FEBC2E'}} />
          <div style={{width:12,height:12,borderRadius:'50%',background:'#28C840'}} />
          <span style={{marginLeft:'auto',fontSize:'var(--text-xs)',color:'rgba(255,255,255,0.4)'}}>ai_project.py</span>
        </div>

        <pre style={{
          fontFamily: "'Fira Code', 'Courier New', monospace",
          fontSize: 13,
          lineHeight: 1.7,
          color: 'rgba(255,255,255,0.85)',
          overflow: 'hidden',
        }}><code>{`<span style="color:#9CDCFE">import</span> openai

<span style="color:#DCDCAA">def</span> <span style="color:#4EC9B0">build_ai_app</span>():
    <span style="color:#CE9178">"""60-minute AI project"""</span>
    client = openai.OpenAI()
    
    response = client.chat.completions\\
        .create(
            model=<span style="color:#CE9178">"gpt-4o-mini"</span>,
            messages=[{<span style="color:#9CDCFE">"role"</span>: <span style="color:#CE9178">"user"</span>,
                       <span style="color:#9CDCFE">"content"</span>: prompt}]
        )
    <span style="color:#C586C0">return</span> response.choices[<span style="color:#B5CEA8">0</span>].message`}</code></pre>
      </div>

      {/* Floating cards */}
      <div style={{
        position: 'absolute',
        top: -20,
        right: -20,
        background: 'var(--color-green-500)',
        borderRadius: 'var(--radius)',
        padding: 'var(--space-3) var(--space-4)',
        color: 'white',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--fw-bold)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
      }}>
        <CheckCircle size={14} />
        Free Workshop
      </div>

      <div style={{
        position: 'absolute',
        bottom: -16,
        left: -16,
        background: 'white',
        borderRadius: 'var(--radius)',
        padding: 'var(--space-3) var(--space-4)',
        color: 'var(--color-navy-900)',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--fw-semibold)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
      }}>
        <Users size={14} color="var(--color-blue-500)" />
        <span>For final-year students</span>
      </div>
    </div>
  );
}

// ── FAQ Item ───────────────────────────────────────────────────
const FAQS = [
  {
    q: 'Is the workshop free?',
    a: 'Yes, completely free. There are no registration fees, no hidden charges. Just sign up and attend.',
  },
  {
    q: 'Who can attend?',
    a: 'The workshop is designed for final-year engineering students in India who want practical, hands-on experience building AI projects. Basic programming knowledge is helpful but deep AI expertise is not required.',
  },
  {
    q: 'Do I need prior AI experience?',
    a: 'No. This is a beginner-friendly session. You should be comfortable with basic Python or similar programming. No prior machine learning or AI knowledge is assumed.',
  },
  {
    q: 'How do I register?',
    a: 'Click "Register for Free" on this page. Fill in your name, email, college, and year of study. You will see a confirmation screen after successful registration. Workshop joining details will be shared through the official organizer before the session.',
  },
  {
    q: 'How does the referral competition work?',
    a: 'When you register, you receive a personal shareable link. Every unique registration that uses your link is counted toward your referral total. The top student referrers, club conveners, and content creators win goodies. See the Leaderboard page for current standings and rules.',
  },
  {
    q: 'How will workshop joining details be shared?',
    a: 'The workshop link and timing will be communicated by the official organizer through the contact details you provide at registration. Please check your email. Automated confirmation emails are not guaranteed from this platform.',
  },
];

function FAQItem({ faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button
        className="faq-question"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        {faq.q}
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {open && <div className="faq-answer">{faq.a}</div>}
    </div>
  );
}

// ── Stats Bar ──────────────────────────────────────────────────
function StatBar() {
  const stats = [
    { label: 'Duration', value: '60 mins', icon: <Clock size={18} /> },
    { label: 'Format', value: 'Online', icon: <Monitor size={18} /> },
    { label: 'Cost', value: 'Free', icon: <CheckCircle size={18} /> },
    { label: 'Target audience', value: 'Final-year engineers', icon: <GraduationCap size={18} /> },
  ];
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 'var(--radius-lg)',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      overflow: 'hidden',
      marginTop: 'var(--space-12)',
    }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          padding: 'var(--space-5) var(--space-6)',
          borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
        }}>
          <div style={{color:'var(--color-green-500)'}}>{s.icon}</div>
          <div>
            <div style={{fontSize:'var(--text-xs)',color:'rgba(255,255,255,0.5)',marginBottom:2}}>{s.label}</div>
            <div style={{fontSize:'var(--text-sm)',fontWeight:'var(--fw-semibold)',color:'white'}}>{s.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Benefits Section ───────────────────────────────────────────
const BENEFITS = [
  {
    icon: <Code2 size={22} />,
    title: 'Build a working AI project',
    desc: 'Follow along and write real code that calls an AI API, processes a prompt, and returns a useful result.',
    color: '#2563EB',
    bg: '#EFF6FF',
  },
  {
    icon: <Brain size={22} />,
    title: 'Understand core AI concepts',
    desc: 'Learn how language models work, what prompts are, and why AI is becoming a fundamental engineering skill.',
    color: '#7C3AED',
    bg: '#EDE9FE',
  },
  {
    icon: <Rocket size={22} />,
    title: 'Gain practical confidence',
    desc: 'Leave with a project you built yourself — something you can mention in interviews and show on your portfolio.',
    color: '#16A34A',
    bg: '#F0FDF4',
  },
  {
    icon: <BookOpen size={22} />,
    title: 'Beginner-friendly guidance',
    desc: 'Clear, step-by-step walkthroughs. No jargon, no assumed knowledge. Just practical learning.',
    color: '#D97706',
    bg: '#FFFBEB',
  },
];

// ── How It Works ───────────────────────────────────────────────
const HOW_STEPS = [
  {
    step: '01',
    title: 'Register for free',
    desc: 'Fill in the short registration form. It takes under a minute.',
  },
  {
    step: '02',
    title: 'Receive workshop details',
    desc: 'The official organizer will share the workshop link and timing through your registered contact details.',
  },
  {
    step: '03',
    title: 'Join and build',
    desc: 'Join the online session and follow along to build your first AI project in 60 minutes.',
  },
];

// ── Main Page Component ────────────────────────────────────────
export default function LandingPage() {
  return (
    <>
      <Navbar />

      {/* HERO */}
      <section className="hero" aria-labelledby="hero-heading">
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-16)',
            alignItems: 'center',
          }} className="hero-grid">

            {/* Left */}
            <div>
              <div className="hero-badge">
                <Star size={14} />
                Free · Beginner-friendly · Final-year Engineers
              </div>

              <h1 className="hero-heading" id="hero-heading">
                Build Your First<br />
                <em>AI Project</em><br />
                in 60 Minutes
              </h1>

              <p className="hero-sub">
                A free, hands-on online workshop for final-year engineering students.
                No prior AI experience required. Just bring curiosity and basic Python knowledge.
              </p>

              <div className="hero-meta">
                <div className="hero-meta-item">
                  <Clock size={16} color="var(--color-green-500)" />
                  60-minute session
                </div>
                <div className="hero-meta-item">
                  <Monitor size={16} color="var(--color-green-500)" />
                  Online (link shared before session)
                </div>
                <div className="hero-meta-item">
                  <CheckCircle size={16} color="var(--color-green-500)" />
                  Completely free
                </div>
              </div>

              <div className="hero-cta-group">
                <Link to="/register" className="btn btn-green btn-lg" id="hero-register-btn">
                  Register for Free
                  <ArrowRight size={18} />
                </Link>
                <Link to="/leaderboard" className="btn btn-lg" style={{
                  background:'rgba(255,255,255,0.1)',
                  color:'white',
                  border:'1.5px solid rgba(255,255,255,0.2)',
                }} id="hero-leaderboard-btn">
                  <Trophy size={18} />
                  Leaderboard
                </Link>
              </div>

              <StatBar />
            </div>

            {/* Right */}
            <div className="hero-visual hide-mobile">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="section" aria-labelledby="benefits-heading">
        <div className="container">
          <div className="text-center" style={{maxWidth:560,margin:'0 auto var(--space-12)'}}>
            <p className="section-label">What you'll explore</p>
            <h2 className="section-heading" id="benefits-heading">
              Practical AI, not theory
            </h2>
            <p className="section-subheading" style={{margin:'0 auto'}}>
              In 60 minutes, you'll move from zero to a working AI-powered project.
              Here's what the session covers.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--space-6)',
          }}>
            {BENEFITS.map((b, i) => (
              <div key={i} className="card card-hover">
                <div style={{
                  width: 48, height: 48,
                  borderRadius: 'var(--radius)',
                  background: b.bg,
                  color: b.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 'var(--space-4)',
                }}>
                  {b.icon}
                </div>
                <h3 style={{fontSize:'var(--text-base)',fontWeight:'var(--fw-semibold)',marginBottom:'var(--space-2)',color:'var(--color-navy-900)'}}>
                  {b.title}
                </h3>
                <p style={{fontSize:'var(--text-sm)',color:'var(--color-gray-500)',lineHeight:1.7}}>
                  {b.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO SHOULD ATTEND */}
      <section className="section" style={{background:'var(--color-gray-50)'}} aria-labelledby="who-heading">
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-16)',
            alignItems: 'center',
          }} className="hero-grid">
            <div>
              <p className="section-label">Who should attend</p>
              <h2 className="section-heading" id="who-heading">
                Made for final-year<br />engineering students
              </h2>
              <p style={{color:'var(--color-gray-500)',lineHeight:1.7,marginBottom:'var(--space-6)'}}>
                This workshop is designed specifically for final-year B.Tech and BE students
                across India who want to add a practical AI skill before entering the job market
                or applying to graduate programs.
              </p>

              <div style={{display:'flex',flexDirection:'column',gap:'var(--space-4)'}}>
                {[
                  'You\'re in your final year of B.Tech or BE',
                  'You know basic Python or have programmed before',
                  'You\'re curious about AI but haven\'t built anything yet',
                  'You want something concrete to show in interviews',
                  'You can spare 60 minutes for a live online session',
                ].map((item, i) => (
                  <div key={i} style={{display:'flex',alignItems:'flex-start',gap:'var(--space-3)'}}>
                    <CheckCircle size={18} color="var(--color-green-600)" style={{marginTop:2,flexShrink:0}} />
                    <span style={{fontSize:'var(--text-sm)',color:'var(--color-gray-700)'}}>{item}</span>
                  </div>
                ))}
              </div>

              <div style={{marginTop:'var(--space-8)'}}>
                <Link to="/register" className="btn btn-primary btn-lg" id="who-register-btn">
                  Register Now — It's Free
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>

            <div className="hide-mobile">
              <div className="card" style={{padding:'var(--space-8)'}}>
                <div style={{
                  background:'linear-gradient(135deg,var(--color-navy-800),var(--color-navy-600))',
                  borderRadius:'var(--radius-lg)',
                  padding:'var(--space-6)',
                  color:'white',
                  marginBottom:'var(--space-6)',
                }}>
                  <GraduationCap size={32} style={{marginBottom:'var(--space-4)'}} />
                  <div style={{fontFamily:'var(--font-display)',fontSize:'var(--text-2xl)',fontWeight:'var(--fw-bold)',marginBottom:'var(--space-2)'}}>
                    Final-Year Ready
                  </div>
                  <div style={{fontSize:'var(--text-sm)',color:'rgba(255,255,255,0.75)'}}>
                    Graduate with a real AI project in your portfolio
                  </div>
                </div>

                <div style={{display:'flex',flexDirection:'column',gap:'var(--space-3)'}}>
                  {[
                    { label: 'Experience required', value: 'Basic Python' },
                    { label: 'Session type', value: 'Live, online' },
                    { label: 'Duration', value: '60 minutes' },
                    { label: 'Certificate', value: 'TBD by organizer' },
                    { label: 'Cost', value: '₹0 — Free' },
                  ].map((r, i) => (
                    <div key={i} style={{
                      display:'flex',justifyContent:'space-between',
                      padding:'var(--space-3) 0',
                      borderBottom: i < 4 ? '1px solid var(--color-gray-100)' : 'none',
                      fontSize:'var(--text-sm)',
                    }}>
                      <span style={{color:'var(--color-gray-500)'}}>{r.label}</span>
                      <span style={{fontWeight:'var(--fw-semibold)',color:'var(--color-navy-900)'}}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" aria-labelledby="how-heading">
        <div className="container">
          <div className="text-center" style={{maxWidth:540,margin:'0 auto var(--space-12)'}}>
            <p className="section-label">Simple process</p>
            <h2 className="section-heading" id="how-heading">How it works</h2>
            <p className="section-subheading" style={{margin:'0 auto'}}>
              Three straightforward steps. No complicated onboarding.
            </p>
          </div>

          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))',
            gap:'var(--space-8)',
            maxWidth:800,
            margin:'0 auto',
          }}>
            {HOW_STEPS.map((step, i) => (
              <div key={i} style={{textAlign:'center'}}>
                <div style={{
                  width:64,height:64,
                  borderRadius:'50%',
                  background:'var(--color-navy-800)',
                  color:'white',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontFamily:'var(--font-display)',
                  fontSize:'var(--text-xl)',
                  fontWeight:'var(--fw-bold)',
                  margin:'0 auto var(--space-6)',
                  position:'relative',
                }}>
                  {step.step}
                  {i < HOW_STEPS.length - 1 && (
                    <div style={{
                      position:'absolute',
                      left:'100%',
                      top:'50%',
                      width:'100%',
                      height:2,
                      background:'var(--color-gray-200)',
                      marginLeft:'var(--space-4)',
                    }} className="hide-mobile" />
                  )}
                </div>
                <h3 style={{fontSize:'var(--text-lg)',fontWeight:'var(--fw-semibold)',marginBottom:'var(--space-2)',color:'var(--color-navy-900)'}}>
                  {step.title}
                </h3>
                <p style={{fontSize:'var(--text-sm)',color:'var(--color-gray-500)',lineHeight:1.7}}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REFERRAL CTA */}
      <section style={{background:'var(--color-navy-900)',padding:'var(--space-20) 0'}} aria-labelledby="referral-cta-heading">
        <div className="container text-center">
          <div style={{
            display:'inline-flex',alignItems:'center',justifyContent:'center',
            width:64,height:64,
            borderRadius:'50%',
            background:'rgba(255,255,255,0.1)',
            marginBottom:'var(--space-6)',
          }}>
            <Trophy size={28} color="var(--color-amber-500)" />
          </div>
          <h2 style={{
            fontFamily:'var(--font-display)',
            fontSize:'var(--text-4xl)',
            fontWeight:'var(--fw-bold)',
            color:'white',
            marginBottom:'var(--space-4)',
          }} id="referral-cta-heading">
            Refer friends, win goodies
          </h2>
          <p style={{
            fontSize:'var(--text-lg)',
            color:'rgba(255,255,255,0.65)',
            maxWidth:560,
            margin:'0 auto var(--space-8)',
            lineHeight:1.7,
          }}>
            After registering, share your unique link. Top student referrers, club conveners,
            and content creators win goodies worth ₹200 each. Total prize pool: ₹1,600.
          </p>
          <div style={{display:'flex',flexWrap:'wrap',gap:'var(--space-4)',justifyContent:'center',marginBottom:'var(--space-8)'}}>
            {[
              { label: 'Student ambassadors', prize: 'Top 3 win ₹200 each', color: '#2563EB' },
              { label: 'Club conveners', prize: 'Top 3 win ₹200 each', color: '#7C3AED' },
              { label: 'Content creators', prize: 'Top 2 win ₹200 each', color: '#D97706' },
            ].map((c, i) => (
              <div key={i} style={{
                background:'rgba(255,255,255,0.07)',
                border:'1px solid rgba(255,255,255,0.12)',
                borderRadius:'var(--radius-lg)',
                padding:'var(--space-5) var(--space-6)',
                textAlign:'center',
                minWidth:180,
              }}>
                <div style={{
                  fontSize:'var(--text-xs)',
                  color:'rgba(255,255,255,0.5)',
                  marginBottom:'var(--space-2)',
                  textTransform:'uppercase',
                  letterSpacing:'0.06em',
                  fontWeight:'var(--fw-semibold)',
                }}>{c.label}</div>
                <div style={{
                  fontSize:'var(--text-base)',
                  fontWeight:'var(--fw-bold)',
                  color:'white',
                }}>{c.prize}</div>
              </div>
            ))}
          </div>
          <div style={{display:'flex',flexWrap:'wrap',gap:'var(--space-4)',justifyContent:'center'}}>
            <Link to="/register" className="btn btn-green btn-lg" id="referral-cta-register-btn">
              Register & Get Your Link
              <Share2 size={18} />
            </Link>
            <Link to="/leaderboard" className="btn btn-lg" style={{
              background:'rgba(255,255,255,0.1)',color:'white',border:'1.5px solid rgba(255,255,255,0.2)'
            }} id="referral-cta-leaderboard-btn">
              View Leaderboard
            </Link>
          </div>
          <p style={{
            fontSize:'var(--text-xs)',
            color:'rgba(255,255,255,0.35)',
            marginTop:'var(--space-6)',
          }}>
            Prizes subject to competition rules. See leaderboard for full terms.
            Must reach campaign goal to be eligible.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" aria-labelledby="faq-heading">
        <div className="container">
          <div className="text-center" style={{maxWidth:540,margin:'0 auto var(--space-12)'}}>
            <p className="section-label">Common questions</p>
            <h2 className="section-heading" id="faq-heading">Frequently asked questions</h2>
          </div>

          <div style={{
            maxWidth:720,
            margin:'0 auto',
            display:'flex',
            flexDirection:'column',
            gap:'var(--space-3)',
          }}>
            {FAQS.map((faq, i) => <FAQItem key={i} faq={faq} />)}
          </div>
        </div>
      </section>

      <Footer />

      {/* Mobile hero grid fix */}
      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
