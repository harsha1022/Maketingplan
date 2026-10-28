# Campus Growth — AI Workshop Registration & Referral Platform

> **NxtWave Growth Intern Assessment Project**  
> *A high-conversion student acquisition engine designed to drive 500 verified final-year engineering registrations in 7 days on a ₹2,000 budget.*

---

## 🌟 Executive Summary

**Campus Growth** is a full-stack, responsive growth campaign platform built for the free online workshop: **“Build Your First AI Project in 60 Minutes”**. 

The platform implements multi-channel viral referral attribution, real-time leaderboards with deterministic tie-breaking, a secured administrator control center, and exportable analytics across 5 campus acquisition channels.

### 5 Acquisition Channels
1. **Student Referrers & Campus Ambassadors** (`student`)
2. **Technical Club Conveners** (`club_convener`)
3. **Campus Content Creators & Influencers** (`content_creator`)
4. **Hostel Noticeboards & Dining Hall QR Codes** (`campus_hostel`)
5. **Academic Dean / Department Institutional Announcements** (`institutional_email`)

---

## 🚀 Live Demo & Dual Operational Mode

The application features a **Dual Execution Architecture**:
- **Live Mode (Connected):** Connects to Supabase PostgreSQL with Row Level Security (RLS) and atomic database stored procedures (`register_student` RPC).
- **Zero-Config Demo Mode (Simulated):** If Supabase environment variables are omitted or kept as placeholder values, the application runs entirely in a standalone browser simulation. The assessor can explore registrations, test attribution links, view the 3 leaderboards, and access the protected Admin Dashboard with sample data and clear demo badges.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend Framework** | React 19, Vite, React Router DOM v7 |
| **Styling & Design System** | Custom Vanilla CSS design tokens (`src/index.css`), mobile-first responsive layout, deep navy & emerald palette |
| **Icons & Charts** | Lucide React, Recharts (trend charts & channel distribution) |
| **Utilities** | `qrcode.react` (custom QR rendering & download), `PapaParse` (CSV exports), `date-fns` |
| **Backend & Database** | Supabase PostgreSQL, Row Level Security (RLS), atomic PL/pgSQL stored procedures |
| **Authentication** | Supabase Auth with JWT role verification (`admin`) |
| **Testing** | Vitest with JSDOM (43 passing unit tests across 4 test suites) |
| **Deployment** | Vercel / Netlify with automated SPA client rewrites |

---

## 🏗️ System Architecture & File Structure

```
NXTwaveAssesment/
├── src/
│   ├── App.jsx                     # Master route table, demo mode banner & admin guard
│   ├── index.css                   # Unified CSS design system & responsive tokens
│   ├── context/
│   │   └── AuthContext.jsx         # Supabase Auth session listener + Demo Admin session
│   ├── lib/
│   │   ├── supabase.js             # Supabase client instantiation & safe query wrapper
│   │   ├── validation.js           # Email, phone, college & final-year validation
│   │   ├── referral.js             # First-touch attribution engine & URL builder
│   │   └── export.js               # CSV export generation for registrations & promoters
│   ├── components/layout/
│   │   ├── Navbar.jsx              # Navigation header with workshop countdown & CTAs
│   │   ├── Footer.jsx              # Campaign disclaimer, privacy terms & organizer contact
│   │   └── AdminLayout.jsx         # Responsive admin sidebar & user sign-out
│   └── pages/
│       ├── LandingPage.jsx         # Hero, curriculum, speaker bio, FAQs, proof points
│       ├── RegisterPage.jsx        # Validated registration form with promoter badge
│       ├── ConfirmationPage.jsx    # Post-registration confirmation with native share
│       ├── LeaderboardPage.jsx     # 3 categorized leaderboards + budget breakdown
│       └── admin/
│           ├── AdminLoginPage.jsx        # Admin sign-in with 1-click Demo Explorer
│           ├── AdminDashboardPage.jsx    # KPI metrics, 7-day trend & channel chart
│           ├── AdminPromotersPage.jsx    # Promoter CRUD, QR generator & PNG downloader
│           ├── AdminRegistrationsPage.jsx# Searchable/filterable table with CSV export
│           └── AdminSettingsPage.jsx     # Campaign freeze, status & settings management
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql  # Database schema, enums, RLS policies & RPC logic
│   └── seed/
│       └── demo_data.sql           # Realistic seeded promoter & registration records
├── tests/
│   └── unit/
│       ├── validation.test.js      # Input sanitization and RFC-compliant email checks
│       ├── referral.test.js        # First-touch attribution & session persistence
│       ├── leaderboard.test.js     # Category ranking, tie-breaking & progress rules
│       └── admin_export_privacy.test.js # CSV format, privacy shields & QR URLs
├── DEPLOYMENT.md                   # 10-step production deployment & operations manual
├── vercel.json                     # SPA rewrite rules for Vercel
├── public/_redirects               # SPA rewrite rules for Netlify
├── package.json
└── vite.config.js
```

---

## ⚡ Quick Start (Local Development)

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd NXTwaveAssesment
npm install
```

### 2. Run in Demo Mode (Zero Backend Setup Needed)
Simply start the local development server:
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser. The app runs in interactive Demo Mode!
- Visit `/register?ref=STUDENT001` to test student referral attribution.
- Visit `/register?ref=CSECLUB01` to test club convener attribution.
- Visit `/leaderboard` to view the three categorized prize boards.
- Visit `/admin/login` and click **"⚡ Explore Demo Dashboard (Simulated Admin)"** to access the complete admin portal.

### 3. Run with Live Supabase Backend
1. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
2. Follow the comprehensive instructions in [DEPLOYMENT.md](DEPLOYMENT.md) to create your Supabase database and apply `supabase/migrations/001_initial_schema.sql`.
3. Restart `npm run dev`.

---

## 🧪 Testing & Verification

The project includes automated Vitest unit tests covering form validation, deduplication rules, first-touch attribution, leaderboard ranking, tie-breaking, CSV exports, and privacy protection.

```bash
# Run test suite
npm test

# Build production bundle
npm run build

# Preview build locally
npm run preview
```

**Test Results:** 43 tests passing across 4 test suites.

---

## 🏆 Budget Allocation & Leaderboard Mechanics

Total Campaign Budget: **₹2,000**

| Category | Allocation | Reward Mechanics |
|---|---|---|
| **Leaderboard A: Student Ambassadors** | ₹600 | Top 3 students receive goodies worth ₹200 each |
| **Leaderboard B: Club Conveners** | ₹600 | Top 3 club conveners receive goodies worth ₹200 each |
| **Leaderboard C: Content Creators** | ₹400 | Top 2 content creators receive goodies worth ₹200 each |
| **Physical Printing** | ₹200 | QR posters for hostel blocks, mess halls & campus boards |
| **Contingency Buffer** | ₹200 | Reserve funds for high-traction promoter incentives |

### Attribution & Anti-Fraud Rules
1. **First-Touch Attribution:** The first valid `?ref=` parameter captured during a browsing session receives attribution.
2. **No Double Counting:** Each student is uniquely keyed by `normalized_email`. Concurrent duplicate submissions are rejected at the database constraint level.
3. **Deterministic Tie-Breaking:** If two promoters achieve the same registration count, rank priority is awarded to the promoter who achieved that milestone earliest (`MIN(registered_at) ASC`).
4. **Campaign Freeze:** When administrators mark the campaign as `closed` in Settings, all registration forms lock and leaderboards freeze permanently.

---

## 🔒 Security & Privacy Architecture

- **Row Level Security (RLS):** Anonymous users have zero read access to the `registrations` table. Student personal contact details (phone, email) are strictly hidden from public endpoints.
- **Atomic Database Function:** Registration is processed through `register_student()` PL/pgSQL function with `SECURITY DEFINER`, ensuring atomic transaction guarantees without frontend privilege exposure.
- **No Service-Role Key in Frontend:** Only the Supabase `anon` public key is ever used in client code.
- **Admin Authentication:** Protected routes (`RequireAdmin`) verify Supabase Auth JWT user metadata role `admin`.

---

## 📋 Completed Features & Known Limitations

### Completed Features
- [x] High-conversion responsive landing page with countdown timer and FAQ accordion.
- [x] Accessible student registration form with real-time field validation and final-year check.
- [x] First-touch referral engine with persistent session storage.
- [x] 3 independent prize leaderboards with tie-breaking and progress meters.
- [x] Protected Admin Dashboard with 7-day trend chart, channel breakdown, and KPI cards.
- [x] Admin Promoter Management with QR code canvas generator and PNG image download.
- [x] Searchable, filterable registrations table with CSV export.
- [x] Campaign status controls (Active, Closed, Paused).
- [x] Dual-mode architecture with zero-config Demo Mode.
- [x] 43 automated unit tests with Vitest.
- [x] Production build validation and SPA deployment configurations for Vercel and Netlify.

### Known Limitations
- Automated email delivery (e.g. SendGrid/Resend) is not linked to live SMTP; confirmation details are rendered directly on the post-registration screen with copy and native share actions.
- WhatsApp automation uses direct web links (`https://wa.me/`) rather than the WhatsApp Business Cloud API.
