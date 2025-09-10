import { GoogleAISearchExtractor } from '../ai-search/src/google-ai-search.js';

/**
 * Comprehensive test with 15 diverse queries to validate heuristic AI detection
 */
const TEST_QUERIES = [
  // Science & Technology
  'artificial intelligence benefits',
  'quantum computing explained',
  'renewable energy sources',
  'genetic engineering ethics',
  
  // Health & Medicine  
  'symptoms of diabetes',
  'benefits of meditation',
  'coronavirus prevention methods',
  'mental health awareness',
  
  // Environment & Climate
  'climate change effects',
  'ocean pollution causes',
  'sustainable agriculture practices',
  
  // Social & Economics
  'remote work advantages',
  'cryptocurrency risks',
  'social media impact',
  'economic inequality solutions'
];

async function testHeuristicDetection() {
  console.log('🧪 Testing Heuristic AI Detection with 15 Diverse Queries');
  console.log('=========================================================');
  console.log(`📋 Testing ${TEST_QUERIES.length} queries to validate reliability...\n`);
  
  const results: Array<{
    query: string;
    success: boolean;
    contentLength: number;
    processingTime: number;
    error?: string;
    preview?: string;
  }> = [];
  
  let successCount = 0;
  let totalTime = 0;
  
  for (let i = 0; i < TEST_QUERIES.length; i++) {
    const query = TEST_QUERIES[i];
    console.log(`\n${i + 1}/15: Testing "${query}"`);
    console.log('=' + '='.repeat(50));
    
    const extractor = new GoogleAISearchExtractor();
    
    try {
      const startTime = Date.now();
      const result = await extractor.searchAIContent(query);
      const endTime = Date.now();
      
      const processingTime = endTime - startTime;
      totalTime += processingTime;
      
      if (result.success && result.aiResponse && result.aiResponse.text.length > 500) {
        successCount++;
        console.log(`✅ SUCCESS - ${result.aiResponse.text.length} chars in ${(processingTime/1000).toFixed(1)}s`);
        console.log(`📄 Preview: ${result.aiResponse.text.substring(0, 150)}...`);
        
        results.push({
          query,
          success: true,
          contentLength: result.aiResponse.text.length,
          processingTime,
          preview: result.aiResponse.text.substring(0, 200)
        });
      } else {
        console.log(`❌ FAILED - ${result.error || 'Unknown error'}`);
        results.push({
          query,
          success: false,
          contentLength: 0,
          processingTime,
          error: result.error || 'Unknown error'
        });
      }
      
    } catch (error) {
      console.log(`❌ EXCEPTION - ${error}`);
      results.push({
        query,
        success: false,
        contentLength: 0,
        processingTime: 0,
        error: error instanceof Error ? error.message : 'Exception occurred'
      });
    } finally {
      await extractor.close();
    }
    
    // Small delay between tests to avoid rate limiting
    if (i < TEST_QUERIES.length - 1) {
      console.log('⏳ Waiting 2s before next test...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Summary Report
  console.log('\n\n🎯 HEURISTIC DETECTION TEST RESULTS');
  console.log('====================================');
  console.log(`📊 Success Rate: ${successCount}/${TEST_QUERIES.length} (${((successCount/TEST_QUERIES.length)*100).toFixed(1)}%)`);
  console.log(`⏱️  Average Time: ${(totalTime/TEST_QUERIES.length/1000).toFixed(1)}s per query`);
  console.log(`📏 Average Length: ${Math.round(results.filter(r => r.success).reduce((sum, r) => sum + r.contentLength, 0) / successCount || 0)} chars`);
  
  console.log('\n📋 Detailed Results:');
  console.log('---------------------');
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    const time = (result.processingTime / 1000).toFixed(1);
    console.log(`${status} ${index + 1}. "${result.query}" - ${result.contentLength} chars (${time}s)`);
    if (!result.success && result.error) {
      console.log(`    Error: ${result.error}`);
    }
  });
  
  if (successCount === TEST_QUERIES.length) {
    console.log('\n🎉 ALL TESTS PASSED! Heuristic detection is working perfectly!');
    console.log('✅ Pure heuristic approach successfully replaces hardcoded selectors');
  } else {
    console.log(`\n⚠️  ${TEST_QUERIES.length - successCount} tests failed. Review and improve heuristic logic.`);
  }
  
  console.log('\n🔧 Test Complete - Ready for production validation');
}

// Run the comprehensive test
testHeuristicDetection().catch(console.error);