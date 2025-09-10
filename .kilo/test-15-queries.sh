#!/bin/bash

echo "🧪 Comprehensive 15-Query Test Suite"
echo "====================================="

cd ai-search

# Array of 15 diverse test queries
queries=(
    "what is artificial intelligence"
    "machine learning basics"
    "quantum computing explained"
    "blockchain technology overview"
    "climate change effects"
    "renewable energy sources"
    "space exploration missions"
    "human brain function"
    "genetic engineering applications"
    "cybersecurity threats"
    "virtual reality technology"
    "sustainable agriculture methods"
    "ocean pollution solutions"
    "solar system facts"
    "protein synthesis process"
)

echo ""
echo "📋 Testing ${#queries[@]} diverse queries..."
echo "============================================"

SUCCESS_COUNT=0
FAILED_QUERIES=()
TOTAL_TIME=0

for i in "${!queries[@]}"; do
    query="${queries[$i]}"
    query_num=$((i + 1))
    
    echo ""
    echo "📝 Test ${query_num}/15: \"${query}\""
    echo "$(printf '%.0s-' {1..50})"
    
    # Record start time
    start_time=$(date +%s.%N)
    
    # Run query with timeout
    if timeout 30s npm run dev "$query" >/dev/null 2>&1; then
        end_time=$(date +%s.%N)
        duration=$(echo "$end_time - $start_time" | bc)
        TOTAL_TIME=$(echo "$TOTAL_TIME + $duration" | bc)
        
        echo "✅ PASS: Query completed successfully (${duration}s)"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    else
        echo "❌ FAIL: Query timed out or failed"
        FAILED_QUERIES+=("$query")
    fi
done

echo ""
echo "🏆 TEST RESULTS SUMMARY"
echo "======================="
echo "✅ Successful Queries: $SUCCESS_COUNT/15"
echo "❌ Failed Queries: $((15 - SUCCESS_COUNT))/15"

if [ ${#FAILED_QUERIES[@]} -gt 0 ]; then
    echo ""
    echo "❌ Failed Queries:"
    for failed_query in "${FAILED_QUERIES[@]}"; do
        echo "   • $failed_query"
    done
fi

AVERAGE_TIME=$(echo "scale=2; $TOTAL_TIME / $SUCCESS_COUNT" | bc 2>/dev/null || echo "0")
echo "⏱️  Average Response Time: ${AVERAGE_TIME}s"
echo "📊 Success Rate: $(echo "scale=1; $SUCCESS_COUNT * 100 / 15" | bc)%"

echo ""
if [ $SUCCESS_COUNT -eq 15 ]; then
    echo "🎉 ALL QUERIES PASSED!"
    echo "✅ System is fully reliable across diverse query types"
    exit 0
else
    echo "⚠️  SOME QUERIES FAILED"
    echo "❌ System needs reliability improvements"
    exit 1
fi