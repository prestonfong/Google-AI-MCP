#!/usr/bin/env node

/**
 * Test: Verify project builds successfully
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';

console.log('🧪 Testing: Project Build');

try {
  // Test TypeScript compilation
  console.log('📝 Running TypeScript compilation...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Verify dist files were created
  const expectedFiles = [
    'dist/index.js',
    'dist/google-ai-search.js',
    'dist/types.js',
    'dist/main-col-detector.js',
    'dist/dynamic-selector-utility.js'
  ];
  
  for (const file of expectedFiles) {
    if (!existsSync(file)) {
      throw new Error(`Expected build output file not found: ${file}`);
    }
  }
  
  console.log('✅ BUILD TEST PASSED: All files compiled successfully');
  process.exit(0);
  
} catch (error) {
  console.error('❌ BUILD TEST FAILED:', error.message);
  process.exit(1);
}