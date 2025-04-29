#!/bin/bash
echo "Building frontend..."
cd ../Frontend
npm install
npm run build
echo "Copying frontend build to backend..."
mkdir -p ../Backend/dist
cp -r dist/* ../Backend/dist/