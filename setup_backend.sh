#!/bin/bash
set -e

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   RESUMIND — Backend Setup           ║"
echo "╚══════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")/backend"

echo "→ Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate

echo "→ Installing Python dependencies..."
pip install --upgrade pip -q
pip install -r requirements.txt -q

echo "→ Downloading spaCy model..."
python -m spacy download en_core_web_sm

echo ""
echo "✓ Backend setup complete!"
echo ""
echo "To start the backend:"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  uvicorn main:app --reload --port 8000"
echo ""
