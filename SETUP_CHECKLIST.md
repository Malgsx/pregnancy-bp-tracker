# 🔧 Environment Setup Checklist

Follow this checklist to set up your Pregnancy BP Tracker application.

## ✅ Prerequisites (Already Complete)
- [x] GitHub repository created and configured
- [x] Local development environment ready
- [x] Code deployed to https://github.com/Malgsx/pregnancy-bp-tracker

---

## 🗄️ Step 1: Supabase Setup

### Create Project
- [ ] Go to [https://app.supabase.com](https://app.supabase.com)
- [ ] Sign in with GitHub
- [ ] Click "New Project"
- [ ] Name: `pregnancy-bp-tracker`
- [ ] Generate strong database password
- [ ] Select region closest to you
- [ ] Wait for project creation (2-3 minutes)

### Configure Database
- [ ] Go to SQL Editor
- [ ] Copy contents from `database/schema.sql`
- [ ] Run the SQL to create tables and policies
- [ ] (Optional) Run `database/seed-data.sql` for reference data

### Get API Keys
- [ ] Go to Settings → API
- [ ] Copy Project URL: `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Copy anon key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Copy service role key: `SUPABASE_SERVICE_ROLE_KEY`

---

## 🔐 Step 2: Google OAuth Setup

### Create Google Project
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com)
- [ ] Create new project: "Pregnancy BP Tracker"
- [ ] Enable Google+ API (APIs & Services → Library)

### Configure OAuth
- [ ] Go to OAuth consent screen
- [ ] Choose "External"
- [ ] Fill app name: "Pregnancy BP Tracker"
- [ ] Add your email as support contact
- [ ] Add scopes: `userinfo.email`, `userinfo.profile`, `openid`
- [ ] Add your email as test user

### Get Credentials
- [ ] Go to Credentials → Create OAuth 2.0 Client ID
- [ ] Application type: Web application
- [ ] Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
- [ ] Copy Client ID: `GOOGLE_CLIENT_ID`
- [ ] Copy Client Secret: `GOOGLE_CLIENT_SECRET`

---

## 🍎 Step 3: Apple OAuth Setup (Optional)

> Skip this section if you don't need Apple Sign-In

- [ ] Apple Developer account ($99/year required)
- [ ] Create App ID with Sign In with Apple capability
- [ ] Create Service ID for web authentication
- [ ] Generate private key for JWT signing
- [ ] Configure domains and return URLs

---

## 🔧 Step 4: Local Environment

### Quick Setup
- [ ] Run: `./setup.sh` (generates NextAuth secret automatically)
- [ ] Edit `.env.local` with your actual API keys

### Manual Setup (Alternative)
- [ ] Copy: `cp .env.example .env.local`
- [ ] Generate secret: `openssl rand -base64 32`
- [ ] Fill in all environment variables

### Environment Variables Checklist
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- [ ] `NEXTAUTH_SECRET` - Generated random secret
- [ ] `NEXTAUTH_URL` - http://localhost:3000
- [ ] `GOOGLE_CLIENT_ID` - Google OAuth client ID
- [ ] `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

---

## 🧪 Step 5: Test Your Setup

### Install and Run
- [ ] Install dependencies: `npm install`
- [ ] Start development server: `npm run dev`
- [ ] Open [http://localhost:3000](http://localhost:3000)

### Test Authentication
- [ ] Click "Sign In" button
- [ ] Try Google authentication
- [ ] Check if user profile is created in Supabase
- [ ] Verify you can access protected routes

### Test Database
- [ ] Check Supabase dashboard for user_profiles table
- [ ] Verify RLS policies are working
- [ ] Test creating sample data

---

## 🚨 Troubleshooting

### Common Issues
- **"Invalid redirect URI"**: Check OAuth URLs match exactly
- **"Supabase connection failed"**: Verify URL and keys
- **"NextAuth error"**: Ensure NEXTAUTH_SECRET is set
- **Database errors**: Re-run schema.sql

### Get Help
- See `ENVIRONMENT_SETUP.md` for detailed instructions
- Check `README.md` for additional documentation
- Open GitHub issue for specific problems

---

## 🎉 Success Criteria

Your setup is complete when:
- [ ] Application loads at http://localhost:3000
- [ ] Google Sign-In works without errors
- [ ] User profile is created in Supabase after sign-in
- [ ] Dashboard and profile pages are accessible
- [ ] No console errors in browser developer tools

---

## 📝 Next Steps

Once setup is complete:
1. Explore the application features
2. Test blood pressure tracking functionality
3. Review HIPAA compliance features
4. Consider deploying to production
5. Configure additional OAuth providers if needed

**You're ready to use the Pregnancy BP Tracker! 🚀**