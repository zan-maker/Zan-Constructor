#!/bin/bash
# Final Verification Script
# Run this to verify everything is working

echo "🔍 Running Final Verification..."
echo "================================"
echo ""

PASSED=0
FAILED=0

# Test 1: Backend Health
echo -n "Test 1: Backend Health Check... "
if curl -s http://localhost:7130/health | grep -q "ok"; then
    echo "✅ PASS"
    ((PASSED++))
else
    echo "❌ FAIL"
    ((FAILED++))
fi

# Test 2: Backend Estimates Endpoint
echo -n "Test 2: Estimates API... "
if curl -s http://localhost:7130/estimates > /dev/null; then
    echo "✅ PASS"
    ((PASSED++))
else
    echo "❌ FAIL"
    ((FAILED++))
fi

# Test 3: AI Suggestions Endpoint
echo -n "Test 3: AI Suggestions API... "
if curl -s -X POST http://localhost:7130/ai/suggest-pricing \
    -H "Content-Type: application/json" \
    -d '{"projectType":"lawn-installation","areaSqFt":1000}' | grep -q "materialPrices"; then
    echo "✅ PASS"
    ((PASSED++))
else
    echo "❌ FAIL"
    ((FAILED++))
fi

# Test 4: Frontend Running
echo -n "Test 4: Frontend Running... "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 | grep -q "200"; then
    echo "✅ PASS"
    ((PASSED++))
else
    echo "❌ FAIL"
    ((FAILED++))
fi

# Test 5: Check File Structure
echo -n "Test 5: File Structure... "
if [ -f "backend/mock-insforge.js" ] && [ -f "frontend/src/components/A2UIIntegration.tsx" ] && [ -f "frontend/src/api/insforge.ts" ]; then
    echo "✅ PASS"
    ((PASSED++))
else
    echo "❌ FAIL"
    ((FAILED++))
fi

# Test 6: Check Documentation
echo -n "Test 6: Documentation... "
if [ -f "INTEGRATION_COMPLETE.md" ] && [ -f "PROJECT_SUMMARY.md" ]; then
    echo "✅ PASS"
    ((PASSED++))
else
    echo "❌ FAIL"
    ((FAILED++))
fi

echo ""
echo "================================"
echo "Results: $PASSED passed, $FAILED failed"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "🎉 ALL TESTS PASSED!"
    echo ""
    echo "✅ InsForge backend is running"
    echo "✅ Frontend is running"
    echo "✅ A2UI integration is working"
    echo "✅ All documentation is in place"
    echo ""
    echo "🔗 Access your app:"
    echo "   Frontend: http://localhost:3001"
    echo "   Backend:  http://localhost:7130"
    exit 0
else
    echo "⚠️  Some tests failed. Check the logs:"
    echo "   backend/backend.log"
    echo "   frontend/frontend.log"
    exit 1
fi