#!/bin/bash

# Career Compass - Run All Services Locally
# This script starts all services in separate terminal windows

echo "🚀 Starting Career Compass services..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Start MongoDB (assuming it's installed and configured)
echo -e "${BLUE}Starting MongoDB...${NC}"
# mongod --dbpath ./data/db &
# MONGO_PID=$!

# Start Backend
echo -e "${BLUE}Starting Backend (Node.js)...${NC}"
cd backend
npm install
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to initialize
sleep 3

# Start AI Service
echo -e "${BLUE}Starting AI Service (Python)...${NC}"
cd ai-service
pip install -r requirements.txt
python main.py &
AI_PID=$!
cd ..

# Wait a bit for AI service to initialize
sleep 3

# Start Frontend
echo -e "${BLUE}Starting Frontend (React)...${NC}"
cd frontend
npm install
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}✅ All services started!${NC}"
echo ""
echo "Services running at:"
echo "  Frontend:   http://localhost:5173"
echo "  Backend:    http://localhost:5000"
echo "  AI Service: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
wait

# Cleanup on exit
trap "kill $BACKEND_PID $AI_PID $FRONTEND_PID 2>/dev/null" EXIT
