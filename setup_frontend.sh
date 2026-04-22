#!/bin/bash
set -e

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   RESUMIND — Frontend Setup          ║"
echo "╚══════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")/frontend"

echo "→ Installing npm dependencies..."
npm install

echo ""
echo "✓ Frontend setup complete!"
echo ""
echo "To start the frontend:"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:5173"
echo ""
