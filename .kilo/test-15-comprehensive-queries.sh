#!/bin/bash

# Comprehensive 15-Query Test Suite for AI Search System
# Tests diverse query types to validate system reliability and performance

echo "🧪 Starting Comprehensive 15-Query Test Suite"
echo "=================================================="

# Test results tracking
TOTAL_TESTS=15
PASSED_TESTS=0
FAILED_TESTS=0
RESULTS_FILE=".kilo/test-results-$(date +%Y%m%d-%H%M%S).md"

# Create results file with header
cat > "$RESULTS_FILE" << EOF
# AI Search System Test Results
Generated: $(date)

## Test Suite: 15 Comprehensive Queries

| Query | Status | Time | Content Quality |
|-------|--------|------|----------------|
EOF

# Function to test a query with timeout and validation
test_query() {
    local query="$1"
    local test_num="$2"
    
    echo ""
    echo "🔍 Test $test_num/15: \"$query\""
    echo "----------------------------------------"
    
    # Run with timeout
    timeout 60s npm run dev "$query" > ".kilo/query-$test_num-output.log" 2>&1
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        # Check for successful extraction
        if grep -q "✅ AI response extracted successfully!" ".kilo/query-$test_num-output.log"; then
            # Validate content length (should have substantial content)
            local content_lines=$(grep -A 20 "🤖 AI Response:" ".kilo/query-$test_num-output.log" | wc -l)
            local processing_time=$(grep "⏱️  Processing Time:" ".kilo/query-$test_num-output.log" | sed 's/.*Processing Time: //' | sed 's/s//')
            
            if [ "$content_lines" -gt 5 ]; then
                echo "✅ PASS - Query successful with substantial content"
                echo "| $query | ✅ PASS | ${processing_time}s | Substantial |" >> "$RESULTS_FILE"
                ((PASSED_TESTS++))
            else
                echo "❌ FAIL - Content too short"
                echo "| $query | ❌ FAIL | ${processing_time}s | Too Short |" >> "$RESULTS_FILE"
                ((FAILED_TESTS++))
            fi
        else
            echo "❌ FAIL - No AI response extracted"
            echo "| $query | ❌ FAIL | Timeout | No Response |" >> "$RESULTS_FILE"
            ((FAILED_TESTS++))
        fi
    elif [ $exit_code -eq 124 ]; then
        echo "❌ FAIL - Query timed out (60s limit)"
        echo "| $query | ❌ TIMEOUT | 60s+ | Timeout |" >> "$RESULTS_FILE"
        ((FAILED_TESTS++))
    else
        echo "❌ FAIL - Query failed with exit code $exit_code"
        echo "| $query | ❌ ERROR | - | Error $exit_code |" >> "$RESULTS_FILE"
        ((FAILED_TESTS++))
    fi
}

# Change to ai-search directory
cd ai-search || { echo "❌ Failed to change to ai-search directory"; exit 1; }

# Test 1: Technology & AI
test_query "artificial intelligence basics" 1

# Test 2: Science & Physics  
test_query "quantum computing principles" 2

# Test 3: Health & Medicine
test_query "human immune system function" 3

# Test 4: Environment & Energy
test_query "renewable energy sources 2024" 4

# Test 5: Space & Astronomy
test_query "black holes formation process" 5

# Test 6: Economics & Finance
test_query "cryptocurrency blockchain technology" 6

# Test 7: Biology & Genetics
test_query "DNA replication process" 7

# Test 8: Climate & Environment
test_query "climate change mitigation strategies" 8

# Test 9: Psychology & Neuroscience
test_query "memory formation in brain" 9

# Test 10: Engineering & Materials
test_query "carbon fiber manufacturing process" 10

# Test 11: History & Social Science
test_query "industrial revolution impact society" 11

# Test 12: Mathematics & Computing
test_query "machine learning algorithms overview" 12

# Test 13: Medicine & Healthcare
test_query "cancer immunotherapy treatments" 13

# Test 14: Future Technology
test_query "virtual reality applications 2024" 14

# Test 15: Complex Multi-topic
test_query "sustainable development goals progress" 15

# Generate final results summary
echo "" >> "$RESULTS_FILE"
echo "## Summary" >> "$RESULTS_FILE"
echo "- **Total Tests:** $TOTAL_TESTS" >> "$RESULTS_FILE"
echo "- **Passed:** $PASSED_TESTS" >> "$RESULTS_FILE"  
echo "- **Failed:** $FAILED_TESTS" >> "$RESULTS_FILE"
echo "- **Success Rate:** $(( PASSED_TESTS * 100 / TOTAL_TESTS ))%" >> "$RESULTS_FILE"

echo ""
echo "=================================================="
echo "📊 TEST SUITE COMPLETE"
echo "=================================================="
echo "✅ Passed: $PASSED_TESTS/$TOTAL_TESTS"
echo "❌ Failed: $FAILED_TESTS/$TOTAL_TESTS"
echo "📈 Success Rate: $(( PASSED_TESTS * 100 / TOTAL_TESTS ))%"
echo ""
echo "📄 Detailed results saved to: $RESULTS_FILE"

# Clean up temporary log files
rm -f .kilo/query-*-output.log

# Exit with error if any tests failed
if [ $FAILED_TESTS -gt 0 ]; then
    echo ""
    echo "❌ Some tests failed. Please review the results and fix issues."
    exit 1
else
    echo ""
    echo "🎉 All tests passed! System is performing reliably."
    exit 0
fi