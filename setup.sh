#!/bin/bash

# =============================================================================
# PREGNANCY BP TRACKER - QUICK SETUP SCRIPT
# =============================================================================

echo "🏥 Pregnancy BP Tracker - Environment Setup"
echo "==========================================="
echo ""

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 1
    fi
fi

# Copy example file
echo "📄 Creating .env.local from template..."
cp .env.example .env.local

# Generate NextAuth secret
echo "🔑 Generating NextAuth secret..."
NEXTAUTH_SECRET=$(openssl rand -base64 32)
sed -i.bak "s/your-nextauth-secret-here/$NEXTAUTH_SECRET/" .env.local
rm .env.local.bak

echo "✅ Created .env.local with NextAuth secret generated"
echo ""
echo "📋 Next steps:"
echo "1. Open ENVIRONMENT_SETUP.md for detailed instructions"
echo "2. Set up your Supabase project at https://app.supabase.com"
echo "3. Set up Google OAuth at https://console.cloud.google.com"
echo "4. Edit .env.local with your actual API keys"
echo "5. Run 'npm install' to install dependencies"
echo "6. Run 'npm run dev' to start development server"
echo ""
echo "🔗 Helpful links:"
echo "   Supabase: https://app.supabase.com"
echo "   Google Cloud: https://console.cloud.google.com"
echo "   Full Setup Guide: ./ENVIRONMENT_SETUP.md"
echo ""
echo "Happy coding! 🚀"