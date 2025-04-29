#!/bin/bash
echo "Building frontend..."
cd ../frontend
npm install
npm run build
echo "Copying frontend build to backend..."
mkdir -p ../backend/dist
cp -r dist/* ../backend/dist/