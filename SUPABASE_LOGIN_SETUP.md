# Supabase Login Setup Guide

## ✅ What Was Changed

The login system has been completely rewritten with a clean, simple Supabase OAuth implementation:

1. **Client-side OAuth** - All OAuth flows happen in the browser
2. **Simplified code** - Removed unnecessary server-side OAuth routes
3. **Better error handling** - Clear error messages if env vars are missing
4. **PKCE flow** - More secure OAuth flow

## 🔧 Environment Variables Setup

### Local Development (.env.local)

Create a `.env.local` file in the root directory:

```env
# Supabase Client (Frontend)
VITE_SUPABASE_URL=https://qvgciezihmcprqoybhdx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Supabase Server (Backend)
SUPABASE_URL=https://qvgciezihmcprqoybhdx.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database
DATABASE_URL=postgresql://postgres:[password]@db.qvgciezihmcprqoybhdx.supabase.co:5432/postgres
```

### Vercel Production

Go to **Vercel Dashboard > Your Project > Settings > Environment Variables** and add:

1. **VITE_SUPABASE_URL** = `https://qvgciezihmcprqoybhdx.supabase.co`
2. **VITE_SUPABASE_ANON_KEY** = Your Supabase Anon Key
3. **SUPABASE_URL** = `https://qvgciezihmcprqoybhdx.supabase.co`
4. **SUPABASE_ANON_KEY** = Your Supabase Anon Key
5. **SUPABASE_SERVICE_ROLE_KEY** = Your Supabase Service Role Key
6. **DATABASE_URL** = Your Supabase PostgreSQL connection string

**Important:** After adding environment variables, **Redeploy** your Vercel project.

## 🔐 Supabase Dashboard Configuration

### 1. Get Your Keys

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings > API**
4. Copy:
   - **Project URL** → Use for `VITE_SUPABASE_URL` and `SUPABASE_URL`
   - **anon public** key → Use for `VITE_SUPABASE_ANON_KEY` and `SUPABASE_ANON_KEY`
   - **service_role** key → Use for `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### 2. Configure OAuth Provider (Google)

1. Go to **Authentication > Providers**
2. Enable **Google**
3. Add your Google OAuth credentials:
   - **Client ID** (from Google Cloud Console)
   - **Client Secret** (from Google Cloud Console)
4. Add **Redirect URL** in Google Cloud Console:
   - `https://qvgciezihmcprqoybhdx.supabase.co/auth/v1/callback`

### 3. Configure Redirect URLs

1. Go to **Authentication > URL Configuration**
2. Add to **Redirect URLs**:
   - `https://marinamartek.vercel.app/`
   - `http://localhost:5000/` (for local development)

### 4. Get Database Connection String

1. Go to **Settings > Database**
2. Scroll to **Connection string**
3. Select **URI** tab
4. Copy the connection string → Use for `DATABASE_URL`
   - Format: `postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true`

## 🚀 How It Works

1. **User clicks "Log In to Book"**
   - Frontend calls `supabase.auth.signInWithOAuth({ provider: 'google' })`
   - Supabase redirects to Google OAuth

2. **User authenticates with Google**
   - Google redirects back to Supabase
   - Supabase redirects to your app with tokens in URL hash

3. **Frontend handles callback**
   - `useAuth` hook detects tokens in URL hash
   - Supabase automatically sets the session
   - User is logged in!

4. **API requests**
   - Frontend includes `Authorization: Bearer <token>` header
   - Backend verifies token with Supabase
   - User data is synced to your database

## 🐛 Troubleshooting

### "Missing Supabase environment variables" error

- Check that `.env.local` exists and has all required variables
- Restart your dev server after adding env vars
- In Vercel, make sure env vars are set and project is redeployed

### OAuth redirect not working

- Check Supabase Dashboard > Authentication > URL Configuration
- Make sure your redirect URL is in the allowed list
- Check that Google OAuth is properly configured in Supabase

### "placeholder.supabase.co" in URL

- This means `VITE_SUPABASE_URL` is not set
- Check your `.env.local` file
- In Vercel, check environment variables are set correctly

### Database connection errors

- Verify `DATABASE_URL` is correct
- Check that your Supabase database is active
- Make sure you're using the connection pooler URL (port 6543) for serverless

## 📝 Notes

- All OAuth happens **client-side** - no server-side OAuth routes needed
- The `/api/callback` route is no longer used
- Session is automatically persisted by Supabase
- Tokens are stored securely by Supabase client

