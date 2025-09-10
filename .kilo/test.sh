#!/bin/bash

# Google AI Search Extractor - Comprehensive Test Suite
# Tests all functionality to ensure the moved project works correctly

set -e  # Exit on any error

echo "🧪 Running Comprehensive Test Suite for Google AI Search Extractor"
echo "=================================================================="

# Test 1: Build verification
echo ""
echo "🔧 Test 1/3: Build Verification"
node .kilo/test-build.js || exit 1

# Test 2: CLI Interface
echo ""
echo "🖥️  Test 2/3: CLI Interface"
node .kilo/test-cli.js || exit 1

# Test 3: API/Module Exports
echo ""
echo "📦 Test 3/3: API/Module Exports"
node .kilo/test-api.js || exit 1

echo ""
echo "🎉 ALL TESTS PASSED! The Google AI Search Extractor is working correctly."
echo "✅ The moved project is fully functional and ready to use."
echo ""
echo "Usage Examples:"
echo "  npm run dev \"what is machine learning\""
echo "  node dist/index.js \"latest tech news\""