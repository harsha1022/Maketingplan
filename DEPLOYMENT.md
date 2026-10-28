# Campus Growth — Step-by-Step Deployment & Operations Guide

This guide outlines how to configure, test, and deploy the **NxtWave Campus Growth — AI Workshop Registration & Referral Platform** to production using Supabase and Vercel/Netlify.

---

## 1. Create and Configure a Supabase Project

1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **New project**, choose your organization, name the project `campus-growth`, and set a strong database password.
3. Select the closest AWS region to your target audience (e.g., `ap-south-1` Mumbai for Indian college students).
4. Once provisioned, navigate to **Project Settings** > **API**:
   - Copy the **Project URL** (e.g., `https://xyzcompany.supabase.co`).
   - Copy the **`anon` `public` API key** (Safe for frontend exposure).
   - *Never copy or use the `service_role` secret key in the frontend client.*

---

## 2. Apply Database Schema and Migrations

1. Go to the **SQL Editor** in your Supabase Dashboard.
2. Open the migration file from this repository:
   [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql)
3. Paste the contents into the SQL Editor and click **Run**.
   - This sets up:
     - Enums (`promoter_category`, `campaign_status`, `registration_status`, `event_type`).
     - Tables: `campaign_settings`, `promoters`, `registrations`, `referral_events`, `admin_audit_log`.
     - Indexes and unique constraints (including `idx_registrations_normalized_email`).
     - Stored procedures: `normalize_email`, `generate_referral_code`, `register_student`, and `log_referral_click`.
     - Row Level Security (RLS) policies protecting student privacy.
4. *(Optional for testing)* To populate sample promoters and campaign history for demonstration, run:
   [`supabase/seed/demo_data.sql`](supabase/seed/demo_data.sql)

---

## 3. Configure Authentication & Administrator Access

The platform uses Supabase Auth for authorized campaign administrators.

1. In Supabase Dashboard, go to **Authentication** > **Users**.
2. Click **Add user** > **Create user**:
   - Email: `admin@yourdomain.com` (or your preferred admin email).
   - Password: Set a secure password.
   - Toggle **Auto Confirm User?** to **ON**.
3. Grant the `admin` role by assigning user metadata:
   - Run the following SQL query in the **SQL Editor**:
     ```sql
     UPDATE auth.users
     SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
     WHERE email = 'admin@yourdomain.com';
     ```
   - Verify the update:
     ```sql
     SELECT id, email, raw_user_meta_data->>'role' AS role FROM auth.users;
     ```

---

## 4. Local Environment Configuration

1. In your local repository root, copy the `.env.example` file:
   ```bash
   cp .env.example .env
   ```
2. Populate `.env` with your real Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_APP_URL=http://localhost:5173
   VITE_APP_NAME="Campus Growth"
   ```
3. If `.env` is omitted or left as placeholder, the application automatically enters **Demo Mode** with local simulation, allowing immediate review without database configuration.

---

## 5. Running the Application Locally

```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 6. Running Automated Tests & Production Build

Ensure all unit tests pass and the production bundle compiles with zero errors:

```bash
# Run Vitest test suite
npm test

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 7. Deploying Frontend to Vercel or Netlify

### Option A: Deploy with Vercel (Recommended)
1. Push your code to GitHub / GitLab.
2. Go to [Vercel](https://vercel.com) and click **Add New** > **Project**.
3. Import this repository.
4. In the **Environment Variables** section, add:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL.
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key.
   - `VITE_APP_URL`: Your production Vercel URL (e.g., `https://campus-growth.vercel.app`).
   - `VITE_APP_NAME`: `Campus Growth`
5. Framework Preset: **Vite**.
6. Build Command: `npm run build` | Output Directory: `dist`.
7. Click **Deploy**.

*Note on SPA Routing in Vercel:* Ensure `vercel.json` exists or rewrites all routes to `/index.html`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Option B: Deploy with Netlify
1. Go to [Netlify](https://app.netlify.com) and select **Add new site** > **Import an existing project**.
2. Set Build command: `npm run build` and Publish directory: `dist`.
3. Add the environment variables under **Site configuration** > **Environment variables**.
4. In `public/_redirects`, add:
   ```
   /*    /index.html   200
   ```
5. Click **Deploy Site**.

---

## 8. Verifying Public Registration & Referral Flow

1. Open `/register?ref=STUDENT001` in an incognito window.
2. Confirm the promoter attribution banner displays: `Referred by: Arjun Sharma (IIT Hyderabad)`.
3. Fill out the registration form with a valid email and study year (`Final Year`).
4. Submit the form:
   - Verify redirect to `/confirmation`.
   - Verify unique registration ID is generated.
   - Verify social share links contain the user's referral parameter.
5. Attempt duplicate registration with the same email:
   - Verify that the form rejects it with: *"This email address is already registered."*

---

## 9. Verifying Admin Dashboard & Leaderboard

1. Navigate to `/admin/login`.
2. Sign in with your registered admin credentials.
3. Verify:
   - **Metrics Cards**: Displays total registrations, daily counts, and progress towards 500.
   - **Charts**: 7-day registration trend and channel breakdown render properly.
   - **Promoters Page**: Add a new promoter, click **QR Code**, verify preview and PNG download.
   - **Registrations Table**: Search by student name/college, filter by acquisition channel, and test **Export CSV**.
   - **Leaderboard Page (`/leaderboard`)**: Verify the 3 separate panels (Ambassadors, Clubs, Creators) with tie-breakers.

---

## 10. Troubleshooting Common Issues

| Issue | Cause | Resolution |
|---|---|---|
| **"Demo Mode" banner persists on production** | Missing or incorrect environment variables. | Check Vercel/Netlify Environment Variables. Ensure variable names start with `VITE_` and trigger a redeploy. |
| **"Supabase is not configured" on submit** | Frontend client is using placeholder keys. | Replace placeholder strings in `.env` or deployment settings. |
| **Admin login fails with "Invalid login credentials"** | User not created or password incorrect. | Check Supabase Auth Users table; ensure email confirmation is enabled or auto-confirmed. |
| **Admin login redirects back to `/admin/login`** | User metadata role is not set to `admin`. | Run the SQL command in Step 3 to add `{"role": "admin"}` to `raw_user_meta_data`. |
| **404 on page refresh on Vercel/Netlify** | SPA client-side routing not configured. | Add `vercel.json` rewrites or Netlify `_redirects` file pointing `/*` to `/index.html 200`. |
| **RPC error: `function register_student does not exist`** | Migration not run. | Run `001_initial_schema.sql` in Supabase SQL Editor. |
