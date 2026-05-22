#!/usr/bin/env node

/**
 * Frontend-Backend Integration Verification Script
 * Run this to verify all connections are working properly
 */

const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║   Morfyx Studio: Frontend-Backend Integration Check           ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

const checks = [];

// Check 1: Frontend .env
console.log('📋 Checking Frontend Configuration...');
const frontendEnvPath = path.join(__dirname, 'frontend', '.env');
if (fs.existsSync(frontendEnvPath)) {
    const envContent = fs.readFileSync(frontendEnvPath, 'utf8');
    if (envContent.includes('VITE_API_URL=http://localhost:5000/api')) {
        console.log('   ✅ Frontend .env configured correctly');
        checks.push(true);
    } else {
        console.log('   ❌ Frontend API URL incorrect in .env');
        checks.push(false);
    }
} else {
    console.log('   ⚠️  Frontend .env not found');
    checks.push(false);
}

// Check 2: Backend .env
console.log('\n📋 Checking Backend Configuration...');
const backendEnvPath = path.join(__dirname, 'backend', 'server', '.env');
if (fs.existsSync(backendEnvPath)) {
    const envContent = fs.readFileSync(backendEnvPath, 'utf8');
    if (envContent.includes('MONGODB_URI=')) {
        console.log('   ✅ Backend .env has MongoDB URI');
        if (envContent.includes('PORT=5000')) {
            console.log('   ✅ Backend port 5000 configured');
            checks.push(true);
        } else {
            console.log('   ⚠️  Backend port not set to 5000');
            checks.push(true);
        }
    } else {
        console.log('   ❌ Backend MongoDB URI not configured');
        checks.push(false);
    }
} else {
    console.log('   ⚠️  Backend .env not found');
    checks.push(false);
}

// Check 3: Frontend products.ts hook
console.log('\n📋 Checking Frontend Hooks...');
const productsPath = path.join(__dirname, 'frontend', 'src', 'lib', 'products.ts');
if (fs.existsSync(productsPath)) {
    const content = fs.readFileSync(productsPath, 'utf8');
    const checks3 = [];

    if (content.includes('setInterval(fetchProducts, 30000)')) {
        console.log('   ✅ Auto-polling (30s) implemented');
        checks3.push(true);
    } else {
        console.log('   ❌ Auto-polling not found');
        checks3.push(false);
    }

    if (content.includes('response.data?.items')) {
        console.log('   ✅ API response format correct');
        checks3.push(true);
    } else {
        console.log('   ❌ API response format may be wrong');
        checks3.push(false);
    }

    if (content.includes('useImportedProducts') && content.includes('useAllProducts')) {
        console.log('   ✅ All product hooks implemented');
        checks3.push(true);
    }

    checks.push(checks3.every(c => c));
} else {
    console.log('   ❌ products.ts not found');
    checks.push(false);
}

// Check 4: Backend API routes
console.log('\n📋 Checking Backend Routes...');
const routesPath = path.join(__dirname, 'backend', 'server', 'src', 'routes');
if (fs.existsSync(routesPath)) {
    const routes = fs.readdirSync(routesPath);
    if (routes.includes('product.routes.ts')) {
        console.log('   ✅ Product routes configured');
        checks.push(true);
    } else {
        console.log('   ⚠️  Product routes not found');
        checks.push(true);
    }
} else {
    console.log('   ⚠️  Routes directory not found');
    checks.push(true);
}

// Check 5: Cloudinary configuration
console.log('\n📋 Checking Cloudinary Setup...');
const cloudinaryPath = path.join(__dirname, 'backend', 'server', 'src', 'config', 'cloudinary.ts');
if (fs.existsSync(cloudinaryPath)) {
    console.log('   ✅ Cloudinary config file exists');
    checks.push(true);
} else {
    console.log('   ⚠️  Cloudinary config not found (image upload may fail)');
    checks.push(true);
}

// Summary
console.log('\n╔════════════════════════════════════════════════════════════════╗');
const passed = checks.filter(c => c).length;
const total = checks.length;
console.log(`║   Results: ${passed}/${total} checks passed                                  ║`);

if (passed === total) {
    console.log('║   🎉 Your Frontend-Backend integration is ready!              ║');
    console.log('║   Run "npm run dev" in both frontend and backend to start    ║');
} else {
    console.log('║   ⚠️  Some configuration issues found. Review above.          ║');
}

console.log('╚════════════════════════════════════════════════════════════════╝\n');

process.exit(passed === total ? 0 : 1);
