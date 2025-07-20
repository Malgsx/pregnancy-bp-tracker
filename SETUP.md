# Authentication Setup Guide

This guide will help you set up OAuth authentication with Google and Apple, along with Supabase integration.

## Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Google Cloud Console Access**: For Google OAuth
3. **Apple Developer Account**: For Apple Sign-In (optional)

## 1. Supabase Setup

### Create a New Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned
3. Go to Settings → API to get your keys

### Database Schema
Run the following SQL in the Supabase SQL Editor to create the required tables:

```sql
-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone_number TEXT,
  date_of_birth DATE,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  healthcare_provider TEXT,
  due_date DATE,
  pregnancy_start_date DATE,
  blood_pressure_target_systolic INTEGER,
  blood_pressure_target_diastolic INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blood_pressure_readings table
CREATE TABLE blood_pressure_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  systolic INTEGER NOT NULL,
  diastolic INTEGER NOT NULL,
  heart_rate INTEGER,
  reading_time TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  symptoms TEXT[],
  medication_taken BOOLEAN DEFAULT FALSE,
  position TEXT,
  arm_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_blood_pressure_readings_user_id ON blood_pressure_readings(user_id);
CREATE INDEX idx_blood_pressure_readings_reading_time ON blood_pressure_readings(reading_time DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_pressure_readings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (these will be updated based on your auth setup)
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can view their own readings" ON blood_pressure_readings
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert their own readings" ON blood_pressure_readings
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update their own readings" ON blood_pressure_readings
  FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');
```

### Get Your Supabase Keys
1. In your Supabase project, go to Settings → API
2. Copy the following values:
   - **Project URL** (for `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_URL`)
   - **anon public key** (for `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **service_role secret key** (for `SUPABASE_SERVICE_ROLE_KEY`)

## 2. Google OAuth Setup

### Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to APIs & Services → Library
   - Search for "Google+ API"
   - Click and enable it

### Configure OAuth Consent Screen
1. Go to APIs & Services → OAuth consent screen
2. Choose "External" user type (unless you have a Google Workspace)
3. Fill in required information:
   - App name: "Pregnancy BP Tracker"
   - User support email: Your email
   - Developer contact email: Your email
4. Add scopes: `email`, `profile`
5. Add test users (your email for development)

### Create OAuth 2.0 Credentials
1. Go to APIs & Services → Credentials
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - For development: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://yourdomain.com/api/auth/callback/google`
5. Copy the **Client ID** and **Client Secret**

## 3. Apple Sign-In Setup (Optional)

### Prerequisites
- Apple Developer Account ($99/year)
- Access to Apple Developer Portal

### Steps
1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Navigate to Certificates, Identifiers & Profiles
3. Create a new App ID or use existing one
4. Enable "Sign In with Apple" capability
5. Create a Service ID for web authentication
6. Configure the Service ID with your domain and redirect URLs
7. Generate a private key for Sign In with Apple
8. Note down your Team ID, Key ID, and Client ID

## 4. Environment Variables Setup

Create a `.env.local` file in your project root:

```bash
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here-generate-with-openssl-rand-base64-32

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Apple OAuth (Optional)
APPLE_CLIENT_ID=your.apple.service.id
APPLE_CLIENT_SECRET=your-apple-private-key-jwt
```

### Generate NextAuth Secret
Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

## 5. Testing the Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000`
3. Click "Sign in with Google"
4. Complete the OAuth flow
5. You should be redirected to the dashboard
6. Check your Supabase database to see if the user profile was created

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**: Make sure your redirect URIs in Google/Apple console match exactly
2. **Supabase connection errors**: Double-check your environment variables
3. **RLS policy errors**: Make sure your Supabase policies allow the operations
4. **NextAuth session issues**: Verify your `NEXTAUTH_SECRET` and `NEXTAUTH_URL`

### Database Connection Test
You can test your Supabase connection in the browser console:
```javascript
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
```

## Production Deployment

When deploying to production:

1. Update `NEXTAUTH_URL` to your production domain
2. Add production redirect URIs to Google/Apple consoles
3. Use secure secret generation for production
4. Enable Supabase's production-ready security settings
5. Set up proper CORS settings in Supabase

## Security Notes

- Never commit `.env.local` to version control
- Use strong, unique secrets for production
- Regularly rotate API keys and secrets
- Enable appropriate Supabase RLS policies
- Consider adding rate limiting for authentication endpoints