import { SimpleAIExtractor } from './simple-ai-extractor.js';

async function quickTest() {
  console.log('🚀 Starting quick test...');
  
  const extractor = new SimpleAIExtractor();
  
  try {
    // Set a 2-minute timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Test timeout after 2 minutes')), 120000)
    );
    
    const testPromise = extractor.extractAIResponse('climate change effects');
    
    const result = await Promise.race([testPromise, timeoutPromise]);
    
    if (result.success) {
      console.log('\n✅ SUCCESS! AI content extracted:');
      console.log('='.repeat(80));
      console.log(result.content);
      console.log('='.repeat(80));
    } else {
      console.log('\n❌ FAILED:', result.error);
    }
  } catch (error) {
    console.log('\n⏰ Test failed or timed out:', error.message);
  } finally {
    try {
      await extractor.close();
    } catch (e) {
      console.log('Error closing extractor:', e);
    }
  }
}

quickTest().catch(console.error);