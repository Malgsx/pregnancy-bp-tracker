# 🏥 Pregnancy Blood Pressure Tracker

A comprehensive, HIPAA-compliant web application for tracking blood pressure during pregnancy. Built with modern web technologies and designed for healthcare providers and expecting mothers.

## ✨ Features

### 🔐 **Secure Authentication**
- OAuth integration with Google and Apple Sign-In
- HIPAA-compliant user management
- Protected routes and session handling

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

**Option A: Quick Setup (Recommended)**
```bash
# Run the setup script
./setup.sh
```

**Option B: Manual Setup**
```bash
# Copy environment template
cp .env.example .env.local

# Generate NextAuth secret
openssl rand -base64 32
```

### 3. Configure Services

Follow the detailed setup guide in [`ENVIRONMENT_SETUP.md`](./ENVIRONMENT_SETUP.md) to configure:

- **Supabase** - Database and real-time features
- **Google OAuth** - Authentication provider  
- **Apple OAuth** - Optional authentication provider

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📚 Documentation

- **[Environment Setup Guide](./ENVIRONMENT_SETUP.md)** - Complete setup instructions
- **[Product Requirements](./PRD.md)** - Detailed feature specifications
- **[Development Guide](./CLAUDE.md)** - Technical implementation details
- **[Setup Instructions](./SETUP.md)** - Additional configuration options

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

Required environment variables (see `.env.example` for template):

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth Configuration
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
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