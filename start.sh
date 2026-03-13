#!/bin/bash
# Quick Start Script for Landscaping Estimator
# Run this to start everything

echo "🚀 Landscaping Estimator - Quick Start"
echo "======================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    local port=$1
    if curl -s http://localhost:$port > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Start Backend
echo -e "${BLUE}Starting InsForge Backend...${NC}"
if check_port 7130; then
    echo -e "${GREEN}✓ Backend already running on port 7130${NC}"
else
    cd backend
    node mock-insforge.js > backend.log 2>&1 &
    sleep 2
    if check_port 7130; then
        echo -e "${GREEN}✓ Backend started on port 7130${NC}"
    else
        echo -e "${YELLOW}⚠ Backend failed to start${NC}"
        echo "  Check backend.log for errors"
    fi
    cd ..
fi

echo ""

# Start Frontend
echo -e "${BLUE}Starting Estimator Frontend...${NC}"
if check_port 3001; then
    echo -e "${GREEN}✓ Frontend already running on port 3001${NC}"
else
    cd frontend
    npm run dev > frontend.log 2>&1 &
    sleep 3
    if check_port 3001; then
        echo -e "${GREEN}✓ Frontend started on port 3001${NC}"
    else
        echo -e "${YELLOW}⚠ Frontend failed to start${NC}"
        echo "  Check frontend.log for errors"
    fi
    cd ..
fi

echo ""
echo "======================================="
echo -e "${GREEN}✅ System Ready!${NC}"
echo ""
echo "🔗 Access your estimator:"
echo -e "   ${BLUE}http://localhost:3001${NC}"
echo ""
echo "🔧 API endpoints:"
echo -e "   ${BLUE}http://localhost:7130/health${NC}"
echo -e "   ${BLUE}http://localhost:7130/estimates${NC}"
echo ""
echo "📝 Logs:"
echo "   backend/backend.log"
echo "   frontend/frontend.log"
echo ""
echo "🛑 To stop:"
echo "   pkill -f mock-insforge"
echo "   pkill -f vite"
echo ""
echo "🎉 Enjoy your AI-powered estimator!"