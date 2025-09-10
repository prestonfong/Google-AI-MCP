import { getGoogleAISearchResponses } from '../ai-search/dist/google-ai-search.js';

console.log('🧪 Testing Parallel AI Search Processing');
console.log('========================================');

const startTime = Date.now();

// Test multiple queries in parallel
const queries = [
  'climate change effects',
  'renewable energy benefits',
  'artificial intelligence future'
];

try {
  console.log(`⏳ Executing ${queries.length} queries in parallel...`);
  
  const results = await getGoogleAISearchResponses(queries);
  
  const totalTime = Date.now() - startTime;
  console.log(`⚡ Parallel execution completed in ${Math.floor(totalTime / 1000)}s`);
  
  // Validate all results
  let allPassed = true;
  
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const query = queries[i];
    
    console.log(`\n📝 Query ${i + 1}: "${query}"`);
    
    if (result.success) {
      const contentLength = result.aiResponse?.text?.length || 0;
      console.log(`  ✅ SUCCESS - ${contentLength} characters extracted`);
      
      if (contentLength < 500) {
        console.log(`  ⚠️  WARNING - Content seems short (${contentLength} chars)`);
        allPassed = false;
      }
      
      // Check content preview
      const preview = (result.aiResponse?.text || '').substring(0, 100);
      console.log(`  📄 Preview: ${preview}...`);
      
    } else {
      console.log(`  ❌ FAILED - ${result.error}`);
      allPassed = false;
    }
  }
  
  if (allPassed) {
    console.log('\n🎉 ALL PARALLEL TESTS PASSED!');
    console.log(`⚡ Performance: ${queries.length} queries in ${Math.floor(totalTime / 1000)}s (avg: ${Math.floor(totalTime / queries.length / 1000)}s per query)`);
    process.exit(0);
  } else {
    console.log('\n❌ SOME PARALLEL TESTS FAILED');
    process.exit(1);
  }
  
} catch (error) {
  console.log(`\n💥 PARALLEL TEST ERROR: ${error.message}`);
  console.log(error.stack);
  process.exit(1);
}