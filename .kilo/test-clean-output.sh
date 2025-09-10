#!/bin/bash

echo "🧪 Testing AI Search Clean Output Format"
echo "========================================="

cd ai-search

# Test 1: Verify no metadata interruptions
echo ""
echo "📝 Test 1: Check for metadata removal"
echo "-------------------------------------"
OUTPUT=$(npm run dev "test query for metadata" 2>&1)
if echo "$OUTPUT" | grep -qi "thank you.*feedback\|privacy policy\|report a problem"; then
    echo "❌ FAIL: Metadata still present in output"
    exit 1
else
    echo "✅ PASS: No metadata interruptions detected"
fi

# Test 2: Verify no website URLs or domains
echo ""
echo "📝 Test 2: Check for URL/domain removal"
echo "----------------------------------------"
if echo "$OUTPUT" | grep -E "(https?://|www\\.|\\.com|\\.org)" >/dev/null; then
    echo "❌ FAIL: URLs or domains still present"
    exit 1
else
    echo "✅ PASS: No URLs or domains detected"
fi

# Test 3: Verify no YouTube timestamps
echo ""
echo "📝 Test 3: Check for timestamp removal"
echo "--------------------------------------"
if echo "$OUTPUT" | grep -E "(\d{1,2}:\d{2}|\d+\s*s\b|\d+\s*min\b)" >/dev/null; then
    echo "❌ FAIL: Timestamps still present"
    exit 1
else
    echo "✅ PASS: No timestamps detected"
fi

# Test 4: Verify content quality and length
echo ""
echo "📝 Test 4: Check content quality"
echo "--------------------------------"
RESPONSE_CONTENT=$(echo "$OUTPUT" | sed -n '/AI Response:/,/━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━/p' | sed '1d;$d')
WORD_COUNT=$(echo "$RESPONSE_CONTENT" | wc -w)

if [ "$WORD_COUNT" -lt 30 ]; then
    echo "❌ FAIL: Content too short ($WORD_COUNT words)"
    exit 1
else
    echo "✅ PASS: Content has sufficient length ($WORD_COUNT words)"
fi

# Test 5: Check for clean paragraph structure
echo ""
echo "📝 Test 5: Check paragraph organization"
echo "--------------------------------------"
if echo "$RESPONSE_CONTENT" | grep -qE "^\s*$"; then
    echo "✅ PASS: Content has paragraph breaks"
else
    echo "⚠️  INFO: Content is in single paragraph format"
fi

echo ""
echo "🎉 CLEAN OUTPUT FORMAT TEST COMPLETE"
echo "====================================="
echo "✅ All critical cleaning tests passed"
echo "📋 Content is properly cleaned and formatted"