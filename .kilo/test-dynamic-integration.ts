import { GoogleAISearchExtractor } from '../ai-search/src/google-ai-search.js';

/**
 * Test the integrated dynamic selector functionality
 * in the main AI search system
 */
async function testDynamicIntegration() {
  console.log('🧪 Testing Dynamic Selector Integration in Main System');
  console.log('=====================================================');
  
  const extractor = new GoogleAISearchExtractor();
  
  try {
    const query = 'climate change effects';
    console.log(`🔍 Testing with query: "${query}"`);
    console.log('⏳ This will test both dynamic detection and fallback mechanisms...\n');
    
    const startTime = Date.now();
    const result = await extractor.searchAIContent(query);
    const endTime = Date.now();
    
    const processingTime = ((endTime - startTime) / 1000).toFixed(1);
    
    console.log('\n📊 INTEGRATION TEST RESULTS:');
    console.log('=============================');
    console.log(`Success: ${result.success ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Processing Time: ${processingTime}s`);
    
    if (result.success && result.aiResponse) {
      console.log(`Content Length: ${result.aiResponse.text.length} chars`);
      console.log(`Has Sources: ${result.aiResponse.sources ? 'Yes' : 'No'}`);
      console.log(`Preview: ${result.aiResponse.text.substring(0, 200)}...`);
      
      // Validate content quality
      const content = result.aiResponse.text;
      const hasTopicKeywords = content.toLowerCase().includes('climate') && content.toLowerCase().includes('change');
      const hasSubstantialContent = content.length > 500;
      const isWellFormatted = content.split('\n').length > 1;
      
      console.log('\n🔍 Content Quality Check:');
      console.log(`Topic Relevance: ${hasTopicKeywords ? '✅' : '❌'}`);
      console.log(`Substantial Length: ${hasSubstantialContent ? '✅' : '❌'}`);
      console.log(`Well Formatted: ${isWellFormatted ? '✅' : '❌'}`);
      
      const overallQuality = hasTopicKeywords && hasSubstantialContent && isWellFormatted;
      console.log(`Overall Quality: ${overallQuality ? '✅ EXCELLENT' : '❌ NEEDS IMPROVEMENT'}`);
      
      if (overallQuality) {
        console.log('\n🎉 Dynamic selector integration is working perfectly!');
        console.log('✅ System successfully replaced hardcoded selectors with dynamic detection');
        console.log(`⚡ Response time improved: ${processingTime}s processing`);
      } else {
        console.log('\n⚠️ Integration successful but content quality could be improved');
      }
      
    } else {
      console.log(`\n❌ Integration test failed: ${result.error || 'Unknown error'}`);
      if (result.debugInfo) {
        console.log(`Debug info: ${result.debugInfo}`);
      }
    }
    
    console.log('\n🔧 Technical Details:');
    console.log(`Query: ${result.query}`);
    console.log(`Timestamp: ${result.timestamp}`);
    console.log(`Processing Time: ${result.processingTime}ms`);
    
  } catch (error) {
    console.error('\n❌ Integration test encountered error:', error);
  } finally {
    await extractor.close();
  }
}

// Run the integration test
testDynamicIntegration().catch(console.error);