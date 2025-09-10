import { AISearchDebugger } from './debug-ai-selectors.js';

async function runDebugTest() {
  const query = process.argv[2] || 'climate change effects';
  console.log(`🚀 Starting debug analysis for: "${query}"`);
  
  const debugTool = new AISearchDebugger();
  
  try {
    await debugTool.debugQuery(query);
    console.log('\n🎉 Debug analysis complete!');
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await debugTool.close();
  }
}

runDebugTest();