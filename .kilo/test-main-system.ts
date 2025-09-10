import { getGoogleAISearchResponse } from '../ai-search/src/google-ai-search.js';

async function testMainSystem() {
  console.log('🧪 Testing updated main AI search system...');
  
  try {
    // Set a 3-minute timeout for the test
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Test timeout after 3 minutes')), 180000)
    );
    
    const testPromise = getGoogleAISearchResponse('climate change effects');
    
    console.log('🚀 Starting AI search for "climate change effects"...');
    const result = await Promise.race([testPromise, timeoutPromise]);
    
    if (result.success) {
      console.log('\n✅ SUCCESS! Main system working correctly');
      console.log('='.repeat(80));
      console.log('Query:', result.query);
      console.log('Processing Time:', result.processingTime + 'ms');
      console.log('Content Length:', result.aiResponse?.text.length);
      console.log('Has Sources:', result.aiResponse?.sources ? 'Yes' : 'No');
      console.log('\nAI Response Preview:');
      console.log(result.aiResponse?.text.substring(0, 500) + '...');
      console.log('='.repeat(80));
      
      // Validate content structure
      const content = result.aiResponse?.text || '';
      const hasEnvironmentalEffects = content.toLowerCase().includes('climate change') && content.length > 1000;
      const hasStructuredContent = content.includes('temperature') || content.includes('weather') || content.includes('ocean');
      
      if (hasEnvironmentalEffects && hasStructuredContent) {
        console.log('✅ Content validation passed - comprehensive climate change information found');
        return true;
      } else {
        console.log('❌ Content validation failed - missing expected climate change details');
        return false;
      }
    } else {
      console.log('\n❌ FAILED:', result.error);
      if (result.debugInfo) {
        console.log('Debug Info:', result.debugInfo);
      }
      return false;
    }
  } catch (error) {
    console.log('\n⏰ Test failed or timed out:', error.message);
    return false;
  }
}

testMainSystem()
  .then(success => {
    if (success) {
      console.log('\n🎉 Main system test PASSED');
      process.exit(0);
    } else {
      console.log('\n💥 Main system test FAILED');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
  });