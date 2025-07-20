# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build production bundle
- `npm run start` - Start production server  
- `npm run lint` - Run ESLint

### Project Setup
This is a fresh Next.js 15.4.2 project with App Router. No tests are currently configured.

## Architecture & Tech Stack

### Core Framework
- **Next.js 15.4.2** with App Router architecture
- **React 19.1.0** with React Server Components
- **TypeScript 5** with strict mode enabled
- Path aliases configured: `@/*` maps to project root

### Authentication & Database
- **Supabase** ecosystem:
  - `@supabase/supabase-js` - Main client
  - `@supabase/ssr` - Server-side rendering helpers (replaces deprecated auth-helpers)
  - `@auth/supabase-adapter` - Auth.js adapter
- **NextAuth.js 4.24.11** for authentication flows
- Ready for PostgreSQL integration through Supabase

### UI & Visualization
- **Tailwind CSS 4** (latest version using PostCSS plugin)
- **Geist fonts** (Sans & Mono) optimized through `next/font`
- **Lucide React** for icons (healthcare/medical icons available)
- **Recharts 3.1.0** for blood pressure data visualization and charts

### Key Configuration Details
- TypeScript target: ES2017
- ESLint uses flat configuration format (modern setup)
- No src directory - components live in root/app structure
- PostCSS configured for Tailwind CSS 4

## Project Structure

```
app/                    # Next.js App Router (not src/app)
├── layout.tsx         # Root layout with Geist fonts
├── page.tsx          # Home page 
├── globals.css       # Global styles + Tailwind
└── favicon.ico

public/               # Static assets
├── *.svg            # Default Next.js icons

PRD.md               # Comprehensive product requirements document
```

## Product Context

This is a **pregnancy blood pressure tracking application** with comprehensive requirements documented in PRD.md. Key product features to implement:

### Core Functionality
- Blood pressure reading entry and tracking
- Trend visualization using Recharts
- Symptom and context logging
- Healthcare provider data export
- Reminder system for regular readings

### Healthcare Focus
- Medical-grade data accuracy requirements
- HIPAA-aware privacy considerations
- Integration with healthcare workflows
- Support for multiple users (family members)

### Technical Implementation Notes
- Use Recharts for all blood pressure trend visualizations
- Supabase handles real-time data sync and user authentication
- Responsive design for mobile-first usage (pregnant users on-the-go)
- Progressive Web App capabilities expected

## Development Guidelines

### Component Architecture
- Use React Server Components by default (Next.js 15 App Router)
- Client components only when needed for interactivity
- Leverage Tailwind for responsive, accessible UI

### Data Management
- Supabase for real-time database operations
- NextAuth.js for authentication flows
- Use TypeScript strict mode for type safety

### Health Data Considerations
- Implement proper data validation for blood pressure readings
- Consider accessibility for users with pregnancy-related limitations
- Ensure data export functionality for healthcare providers

## Current State
- Fresh Next.js bootstrap (default template still active)
- All core dependencies installed and ready
- No custom components or pages implemented yet
- Ready for authentication setup and database schema design