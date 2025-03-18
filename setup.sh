#!/bin/bash
set -e

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🖋️ Letters to Al - Setup Script${NC}"
echo "=============================="
echo ""

# Check if .env files exist
if [ ! -f "./frontend/.env.local" ] || [ ! -f "./backend/.env" ]; then
  echo -e "${GREEN}Creating environment files...${NC}"
  
  # Copy template files if they don't exist
  [ ! -f "./frontend/.env.local" ] && cp ./frontend/.env.template ./frontend/.env.local
  [ ! -f "./backend/.env" ] && cp ./backend/.env.template ./backend/.env
  
  echo "⚠️ Please make sure to set the proper Supabase credentials in .env files"
  echo ""
fi

# Install dependencies for frontend
echo -e "${GREEN}Installing frontend dependencies...${NC}"
cd frontend
npm install
cd ..

# Install dependencies for backend
echo -e "${GREEN}Installing backend dependencies...${NC}"
cd backend
npm install
cd ..

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "To start the project:"
echo "  1. Frontend: cd frontend && npm run dev"
echo "  2. Backend: cd backend && npm run dev"
echo ""
echo "Make sure you've created the letters table in Supabase using database/schema.sql"
echo ""
echo "Enjoy writing letters to the universe! ✨" 