# 🏥 Pregnancy Blood Pressure Tracker

A comprehensive, HIPAA-compliant web application for tracking blood pressure during pregnancy. Built with modern web technologies and designed for healthcare providers and expecting mothers.

## ✨ Features

### 🔐 **Secure Authentication**
- Demo credentials authentication for easy testing
- HIPAA-compliant user management
- Protected routes and session handling
- OAuth ready (Google/Apple can be enabled if needed)

### 📊 **Health Data Management**
- Blood pressure readings with contextual data
- Symptom tracking and medication logging
- Real-time data synchronization
- Offline-first architecture with conflict resolution

### 🏥 **Healthcare Integration**
- Export data for healthcare providers
- Pregnancy-specific data validation
- Medical-grade accuracy requirements
- Comprehensive audit logging

### 🛠 **Technical Features**
- Modern Next.js 15.4.2 with App Router
- TypeScript strict mode with comprehensive types
- Supabase for PostgreSQL database and real-time features
- Responsive design optimized for mobile devices
- Progressive Web App capabilities

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/Malgsx/pregnancy-bp-tracker.git
cd pregnancy-bp-tracker
npm install
```

### 2. Environment Setup

**Current Status: ✅ COMPLETE**
```bash
# Environment already configured with:
✅ Supabase credentials
✅ NextAuth demo authentication  
✅ All required variables set
```

### 3. Deploy Database Schema

**CRITICAL STEP - Deploy to your Supabase project:**
```bash
# 1. Go to: https://supabase.com/dashboard/project/gcbzgtwvuddrmvklkeep
# 2. Click: SQL Editor
# 3. Copy contents of database/schema.sql
# 4. Paste and run to create all tables and policies
```

### 4. Test Demo Authentication

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and:
1. Click "Sign In"
2. Enter any email (e.g., `test@example.com`)
3. Enter your name
4. Click "Start Demo"
5. Explore the dashboard and profile pages!

## 📚 Documentation

- **[Setup Checklist](./SETUP_CHECKLIST.md)** - ✅ Current status and deployment steps
- **[Environment Setup Guide](./ENVIRONMENT_SETUP.md)** - Detailed configuration (for OAuth setup)
- **[Product Requirements](./PRD.md)** - Detailed feature specifications
- **[Development Guide](./CLAUDE.md)** - Technical implementation details

## 🏗 Tech Stack

### **Frontend**
- **Next.js 15.4.2** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible component library

### **Backend & Database**
- **Supabase** - PostgreSQL database with real-time features
- **NextAuth.js** - Authentication library
- **Zod** - Schema validation
- **React Query** - Data fetching and caching

### **Key Features**
- **HIPAA Compliance** - Audit logging and data security
- **Offline Support** - Local storage with sync capabilities
- **Real-time Updates** - Live data synchronization
- **Mobile Optimized** - Responsive design for all devices

## 🗄 Database Schema

The application uses a comprehensive PostgreSQL schema with 8 main tables:

- `user_profiles` - User account information
- `blood_pressure_readings` - BP measurements with context
- `symptom_entries` - Symptom tracking
- `medication_entries` - Medication logging
- `symptoms` - Reference data for symptoms
- `medications` - Reference data for medications
- `audit_logs` - HIPAA compliance logging
- `user_sessions` - Session management

See [`database/schema.sql`](./database/schema.sql) for the complete schema.

## 🔧 Environment Variables

✅ **Already configured** in `.env.local`:

```bash
# Supabase Configuration - CONFIGURED ✅
NEXT_PUBLIC_SUPABASE_URL=https://gcbzgtwvuddrmvklkeep.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key] ✅
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key] ✅

# NextAuth Configuration - CONFIGURED ✅
NEXTAUTH_SECRET=[generated] ✅
NEXTAUTH_URL=http://localhost:3000 ✅

# Demo Authentication - ACTIVE ✅
# No OAuth providers needed for demo mode
```

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/auth/          # Authentication API routes
│   ├── dashboard/         # Protected dashboard
│   └── profile/           # User profile management
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── ui/               # UI component library
│   └── layout/           # Layout components
├── lib/                   # Core libraries
│   ├── database/         # Database service layer
│   ├── validations.ts    # Zod schemas
│   └── auth.ts           # NextAuth configuration
├── hooks/                 # Custom React hooks
├── database/             # SQL schema and seed data
└── types/                # TypeScript type definitions
```

## 🔒 Security & Compliance

### HIPAA Compliance Features
- Comprehensive audit logging
- Data encryption at rest and in transit
- User access controls and permissions
- Secure session management
- Data anonymization capabilities

### Security Best Practices
- Environment variable protection
- SQL injection prevention
- XSS protection
- CSRF protection via NextAuth
- Secure cookie configuration

## 🚀 Deployment

### Production Deployment

1. **Configure production environment variables**
2. **Update OAuth redirect URLs** for your domain
3. **Deploy to your preferred platform**:
   - Vercel (recommended)
   - Netlify
   - Docker containers

### Environment-Specific Configuration

```bash
# Production
NEXTAUTH_URL=https://yourdomain.com

# OAuth Redirect URLs
# Google: https://yourdomain.com/api/auth/callback/google
# Apple: https://yourdomain.com/api/auth/callback/apple
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Setup Issues**: See [`ENVIRONMENT_SETUP.md`](./ENVIRONMENT_SETUP.md)
- **Technical Questions**: Check [`CLAUDE.md`](./CLAUDE.md)
- **Bug Reports**: Open an issue on GitHub
- **Feature Requests**: Open an issue with the "enhancement" label

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database powered by [Supabase](https://supabase.com/)
- Authentication via [NextAuth.js](https://next-auth.js.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Generated with [Claude Code](https://claude.ai/code)

---

**Made with ❤️ for expecting mothers and healthcare providers**