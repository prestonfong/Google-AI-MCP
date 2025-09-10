#!/usr/bin/env node

/**
 * Test: Verify API/Module exports functionality
 */

console.log('🧪 Testing: API/Module Exports');

try {
  // Test import functionality
  console.log('📝 Testing module imports...');
  
  // Dynamic import to test ES modules
  const { getGoogleAISearchResponse, getGoogleAISearchResponses, GoogleAISearchExtractor } = await import('../dist/index.js');
  
  // Verify exports exist
  if (typeof getGoogleAISearchResponse !== 'function') {
    throw new Error('getGoogleAISearchResponse is not exported as a function');
  }
  
  if (typeof getGoogleAISearchResponses !== 'function') {
    throw new Error('getGoogleAISearchResponses is not exported as a function');
  }
  
  if (typeof GoogleAISearchExtractor !== 'function') {
    throw new Error('GoogleAISearchExtractor is not exported as a function');
  }
  
  // Test constructor
  console.log('📝 Testing GoogleAISearchExtractor constructor...');
  const extractor = new GoogleAISearchExtractor();
  
  if (!extractor) {
    throw new Error('GoogleAISearchExtractor constructor failed');
  }
  
  // Verify it has expected methods
  if (typeof extractor.searchAIContent !== 'function') {
    throw new Error('GoogleAISearchExtractor missing searchAIContent method');
  }
  
  if (typeof extractor.close !== 'function') {
    throw new Error('GoogleAISearchExtractor missing close method');
  }
  
  console.log('✅ API TEST PASSED: All exports and constructors work correctly');
  process.exit(0);
  
} catch (error) {
  console.error('❌ API TEST FAILED:', error.message);
  process.exit(1);
}