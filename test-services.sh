#!/bin/bash

# TrendScout AI - Services Health Check
# Проверяет доступность всех 3 сервисов

echo "🔍 TrendScout AI - Health Check"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check service
check_service() {
    local name=$1
    local url=$2

    echo -n "Checking $name... "

    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)

    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ OK${NC} (HTTP $response)"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC} (HTTP $response)"
        return 1
    fi
}

# Check ML Service
echo "1. ML Service (Port 8001)"
check_service "ML Service" "http://localhost:8001/"
echo ""

# Check Backend
echo "2. Backend API (Port 8000)"
check_service "Backend" "http://localhost:8000/"
echo ""

# Check Frontend
echo "3. Frontend (Port 5173)"
check_service "Frontend" "http://localhost:5173/"
echo ""

echo "================================"
echo ""

# Additional checks
echo "📊 Additional Checks:"
echo ""

# Check ML Service endpoints
echo -n "ML Text Embedding endpoint... "
if curl -s -X POST http://localhost:8001/embeddings/text \
    -H "Content-Type: application/json" \
    -d '{"text":"test"}' \
    | grep -q "embedding"; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
fi

# Check Backend API docs
echo -n "Backend API docs... "
if curl -s http://localhost:8000/docs | grep -q "TrendScout"; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
fi

echo ""
echo "================================"
echo -e "${GREEN}Health check complete!${NC}"
echo ""
echo "📝 Next steps:"
echo "  - ML Service: http://localhost:8001/docs"
echo "  - Backend API: http://localhost:8000/docs"
echo "  - Frontend: http://localhost:5173"
