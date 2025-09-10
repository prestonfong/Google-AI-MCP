#!/usr/bin/env node

/**
 * Test: Verify CLI interface functionality
 */

import { execSync } from 'child_process';

console.log('🧪 Testing: CLI Interface');

try {
  // Test help text (should exit with code 1)
  console.log('📝 Testing help text display...');
  try {
    execSync('npm run dev', { stdio: 'pipe' });
    throw new Error('Expected help command to exit with code 1');
  } catch (error) {
    if (error.status !== 1) {
      throw new Error(`Expected exit code 1, got ${error.status}`);
    }
    
    const output = error.stdout.toString();
    const requiredText = [
      'Usage:',
      'npm run dev "your question"',
      'node dist/index.js "your question"'
    ];
    
    for (const text of requiredText) {
      if (!output.includes(text)) {
        throw new Error(`Help text missing required content: "${text}"`);
      }
    }
  }
  
  // Test that built version works
  console.log('📝 Testing built version help...');
  try {
    execSync('node dist/index.js', { stdio: 'pipe' });
    throw new Error('Expected built version help to exit with code 1');
  } catch (error) {
    if (error.status !== 1) {
      throw new Error(`Expected built version exit code 1, got ${error.status}`);
    }
  }
  
  console.log('✅ CLI TEST PASSED: Help interface works correctly');
  process.exit(0);
  
} catch (error) {
  console.error('❌ CLI TEST FAILED:', error.message);
  process.exit(1);
}