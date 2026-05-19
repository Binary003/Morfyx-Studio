#!/bin/bash

# Morfyx Studio - Production Setup Script
# Run this script to set up everything for production deployment

echo "🚀 Morfyx Studio - Production Setup"
echo "===================================="
echo ""

# Check if running from root
if [ ! -d "backend/server" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "Step 1: Installing backend dependencies..."
cd backend/server
npm install > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

echo ""
echo "Step 2: Creating admin user..."
npm run seed:admin
if [ $? -ne 0 ]; then
    echo "❌ Failed to create admin user"
    exit 1
fi

echo ""
echo "Step 3: Installing admin dependencies..."
cd ../../admin
npm install > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Admin dependencies installed"
else
    echo "❌ Failed to install admin dependencies"
    exit 1
fi

echo ""
echo "Step 4: Installing frontend dependencies..."
cd ../frontend
npm install > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

echo ""
echo "✅ Production setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update environment variables in backend/server/.env"
echo "2. IMPORTANT: Change the admin password immediately"
echo "3. Run: npm run dev (in each directory)"
echo ""
echo "🔐 Default admin credentials:"
echo "   Email: admin@morfyx.com"
echo "   Password: admin123"
echo ""
echo "⚠️  NEVER use these credentials in production!"
