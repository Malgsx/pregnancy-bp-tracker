# 🔧 Environment Setup Guide

This guide will walk you through setting up all the required environment variables and services for the Pregnancy BP Tracker application.

## 📋 Prerequisites

- GitHub account (✅ Already have)
- Gmail account for Google OAuth
- Apple Developer account (optional, for Apple Sign-In)

---

## 🗄️ Step 1: Supabase Database Setup

### 1.1 Create Supabase Project

1. **Go to Supabase**: Visit [https://app.supabase.com](https://app.supabase.com)
2. **Sign in** with your GitHub account
3. **Create new project**:
   - Click "New Project"
   - Organization: Select your personal organization
   - Project name: `pregnancy-bp-tracker`
   - Database password: Generate a strong password (save it!)
   - Region: Choose closest to your users
   - Click "Create new project"

### 1.2 Configure Database Schema

1. **Wait for project creation** (2-3 minutes)
2. **Go to SQL Editor** (left sidebar)
3. **Run the schema setup**:
   - Copy the contents of `database/schema.sql` from your project
   - Paste into SQL Editor
   - Click "Run" to create all tables and policies

### 1.3 Add Seed Data (Optional)

1. **Still in SQL Editor**
2. **Run seed data**:
   - Copy contents of `database/seed-data.sql`
   - Paste and run to add reference data for symptoms and medications

### 1.4 Get Supabase Environment Variables

1. **Go to Settings** → **API** (left sidebar)
2. **Copy the following values**:
   ```bash
   # Project URL
   NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
   
   # Public anon key
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
   
   # Service role key (keep this secret!)
   SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
   ```

---

## 🔐 Step 2: Google OAuth Setup

### 2.1 Create Google Cloud Project

1. **Go to Google Cloud Console**: [https://console.cloud.google.com](https://console.cloud.google.com)
2. **Create new project**:
   - Click "Select a project" → "New Project"
   - Project name: `Pregnancy BP Tracker`
   - Click "Create"

### 2.2 Enable Google+ API

1. **Go to APIs & Services** → **Library**
2. **Search for "Google+ API"**
3. **Click "Enable"**

### 2.3 Configure OAuth Consent Screen

1. **Go to APIs & Services** → **OAuth consent screen**
2. **Choose "External"** (unless you have Google Workspace)
3. **Fill out required fields**:
   - App name: `Pregnancy BP Tracker`
   - User support email: Your email
   - App logo: Upload a logo (optional)
   - App domain: `http://localhost:3000` (for development)
   - Developer contact: Your email
4. **Add scopes**:
   - Click "Add or Remove Scopes"
   - Add: `userinfo.email`, `userinfo.profile`, `openid`
5. **Add test users** (for development):
   - Add your email address
6. **Save and continue**

### 2.4 Create OAuth Credentials

1. **Go to APIs & Services** → **Credentials**
2. **Click "Create Credentials"** → **OAuth 2.0 Client IDs**
3. **Application type**: Web application
4. **Name**: `Pregnancy BP Tracker Web Client`
5. **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
6. **Click "Create"**
7. **Copy the credentials**:
   ```bash
   GOOGLE_CLIENT_ID=[your-client-id].googleusercontent.com
   GOOGLE_CLIENT_SECRET=[your-client-secret]
   ```

---

## 🍎 Step 3: Apple OAuth Setup (Optional)

> **Note**: Apple Sign-In requires an Apple Developer account ($99/year)

### 3.1 Configure Apple Developer Account

1. **Go to Apple Developer**: [https://developer.apple.com](https://developer.apple.com)
2. **Sign in** with your Apple ID
3. **Enroll in Apple Developer Program** (if not already)

### 3.2 Create App ID

1. **Go to Certificates, Identifiers & Profiles**
2. **Identifiers** → **App IDs** → **+**
3. **Select "App"** → Continue
4. **Register an App ID**:
   - Description: `Pregnancy BP Tracker`
   - Bundle ID: `com.yourname.pregnancy-bp-tracker`
   - Capabilities: Check "Sign In with Apple"
5. **Continue** → **Register**

### 3.3 Create Service ID

1. **Identifiers** → **Services IDs** → **+**
2. **Register a Services ID**:
   - Description: `Pregnancy BP Tracker Web`
   - Identifier: `com.yourname.pregnancy-bp-tracker.web`
3. **Continue** → **Register**
4. **Configure the Service ID**:
   - Check "Sign In with Apple"
   - Click "Configure"
   - Primary App ID: Select your app ID
   - Domains: `localhost` (for development)
   - Return URLs: `http://localhost:3000/api/auth/callback/apple`
5. **Save** → **Continue** → **Register**

### 3.4 Create Private Key

1. **Keys** → **+**
2. **Register a New Key**:
   - Name: `Pregnancy BP Tracker Sign In Key`
   - Check "Sign In with Apple"
   - Configure: Select your App ID
3. **Continue** → **Register**
4. **Download the key file** (save as `AuthKey_[KEY_ID].p8`)
5. **Note the Key ID**

### 3.5 Create Apple Client Secret

You'll need to generate a JWT token as the client secret. This is complex and typically done server-side. For now, you can use a service like [Apple Auth Key Generator](https://jwt.io/) or skip Apple Sign-In for initial testing.

---

## 🔑 Step 4: Create Environment Variables

### 4.1 Create Local Environment File

1. **In your project directory**, copy the example file:
   ```bash
   cp .env.example .env.local
   ```

### 4.2 Fill in Your Values

Edit `.env.local` with your actual values:

```bash
# =============================================================================
# SUPABASE CONFIGURATION
# =============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key

# =============================================================================
# NEXTAUTH CONFIGURATION
# =============================================================================
NEXTAUTH_SECRET=your-generated-secret-here
NEXTAUTH_URL=http://localhost:3000

# =============================================================================
# GOOGLE OAUTH CONFIGURATION
# =============================================================================
GOOGLE_CLIENT_ID=your-actual-google-client-id.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret

# =============================================================================
# APPLE OAUTH CONFIGURATION (Optional)
# =============================================================================
# APPLE_CLIENT_ID=com.yourname.pregnancy-bp-tracker.web
# APPLE_CLIENT_SECRET=your-generated-jwt-token
```

### 4.3 Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output to `NEXTAUTH_SECRET` in your `.env.local` file.

---

## 🧪 Step 5: Test Your Setup

### 5.1 Install Dependencies

```bash
npm install
```

### 5.2 Start Development Server

```bash
npm run dev
```

### 5.3 Test Authentication

1. **Open**: [http://localhost:3000](http://localhost:3000)
2. **Try signing in** with Google
3. **Check the database** in Supabase to see if user profiles are created

---

## 🚀 Production Deployment

When ready to deploy:

### 5.1 Update OAuth Redirect URLs

**Google Console**:
- Add your production domain: `https://yourdomain.com/api/auth/callback/google`

**Apple Developer**:
- Add your production domain to Return URLs

### 5.2 Update Environment Variables

```bash
NEXTAUTH_URL=https://yourdomain.com
```

### 5.3 Deploy to Vercel/Netlify

1. **Connect your GitHub repository**
2. **Add environment variables** in the deployment platform
3. **Deploy**

---

## 🔍 Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**
   - Check OAuth redirect URLs match exactly
   - Ensure no trailing slashes

2. **"Supabase connection failed"**
   - Verify Supabase URL and keys
   - Check if project is properly created

3. **"NextAuth configuration error"**
   - Ensure NEXTAUTH_SECRET is set
   - Check NEXTAUTH_URL matches your domain

4. **"Database schema errors"**
   - Re-run the schema.sql file
   - Check for any SQL errors in Supabase logs

### Need Help?

- Check the `SETUP.md` file for additional troubleshooting
- Review Supabase documentation: [https://supabase.com/docs](https://supabase.com/docs)
- NextAuth.js documentation: [https://next-auth.js.org](https://next-auth.js.org)

---

## ✅ Checklist

- [ ] Supabase project created and configured
- [ ] Database schema deployed
- [ ] Google OAuth configured
- [ ] Apple OAuth configured (optional)
- [ ] Environment variables set
- [ ] Local development server running
- [ ] Authentication tested
- [ ] Ready for development/deployment

**You're all set! 🎉**