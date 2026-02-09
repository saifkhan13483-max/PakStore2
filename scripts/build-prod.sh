#!/bin/bash
# PakCart Production Build & Deployment Script

echo "--- Starting Production Build ---"

# 1. Install dependencies
echo "Installing dependencies..."
npm install --include=dev

# 2. Build Frontend
echo "Building frontend (Vite)..."
npm run build

# 3. Build Backend
# In this template, the backend is often run via tsx in dev,
# but for production we ensure the dist/ folder is ready.
# If there's a specific server build step, it would go here.
# Currently 'npm run build' handles vite which outputs to dist/public

# 4. Environment Check
echo "Checking critical environment variables..."
if [ -z "$FIREBASE_SERVICE_ACCOUNT" ]; then
  echo "WARNING: FIREBASE_SERVICE_ACCOUNT is not set. Application will run in degraded mode."
fi

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set. Database connections will fail."
  exit 1
fi

echo "--- Build Complete ---"
echo "To run in production: NODE_ENV=production npm start"
