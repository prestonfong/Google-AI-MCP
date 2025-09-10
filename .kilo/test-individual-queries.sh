#!/bin/bash

# Individual Query Test Suite - Windows Compatible
# Tests 15 diverse queries one by one to validate system reliability

echo "🧪 Testing Individual Queries for AI Search System"
echo "================================================="

PASSED=0
FAILED=0
TOTAL=15

# Function to test individual query
test_single() {
    local query="$1"
    local num="$2"
    
    echo ""
    echo "🔍 Test $num/$TOTAL: \"$query\""
    echo "----------------------------------------"
    
    cd ai-search
    timeout 60 npm run dev "$query"
    local result=$?
    cd ..
    
    if [ $result -eq 0 ]; then
        echo "✅ PASS - Query completed successfully"
        ((PASSED++))
    else
        echo "❌ FAIL - Query failed or timed out"
        ((FAILED++))
    fi
}

# Test queries across diverse domains
test_single "artificial intelligence basics" 1
test_single "quantum computing principles" 2  
test_single "human immune system function" 3
test_single "renewable energy sources 2024" 4
test_single "black holes formation process" 5
test_single "cryptocurrency blockchain technology" 6
test_single "DNA replication process" 7
test_single "climate change mitigation strategies" 8
test_single "memory formation in brain" 9
test_single "carbon fiber manufacturing process" 10
test_single "industrial revolution impact society" 11
test_single "machine learning algorithms overview" 12
test_single "cancer immunotherapy treatments" 13
test_single "virtual reality applications 2024" 14
test_single "sustainable development goals progress" 15

echo ""
echo "================================================="
echo "📊 FINAL RESULTS"  
echo "================================================="
echo "✅ Passed: $PASSED/$TOTAL"
echo "❌ Failed: $FAILED/$TOTAL"
echo "📈 Success Rate: $(( PASSED * 100 / TOTAL ))%"

if [ $FAILED -gt 0 ]; then
    echo ""
    echo "❌ Some tests failed. System needs attention."
    exit 1
else
    echo ""
    echo "🎉 All tests passed! System is reliable."
    exit 0
fi