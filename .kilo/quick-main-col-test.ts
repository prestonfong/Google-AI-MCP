/**
 * Quick test to verify main-col selector exists and works
 */

import { chromium } from 'playwright';

async function quickMainColTest() {
  console.log('🔍 Testing main-col selector on Google AI search page...\n');
  
  const browser = await chromium.launch({
    headless: false,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--window-position=-2000,-2000',
      '--window-size=1,1',
      '--start-minimized'
    ]
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1024, height: 600 }
  });

  const page = await context.newPage();
  
  // Test with a simple query
  const query = 'climate change effects';
  const searchUrl = `https://www.google.com/search?authuser=0&udm=50&aep=25&hl=en&source=searchlabs&q=${encodeURIComponent(query)}`;
  
  console.log(`🌐 Navigating to: ${searchUrl}`);
  await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Handle cookie consent
  try {
    const acceptButton = await page.$('button:has-text("Accept all"), button:has-text("I agree"), #L2AGLb');
    if (acceptButton) await acceptButton.click();
    await page.waitForTimeout(2000);
  } catch (error) {
    console.log('No cookie consent needed');
  }

  console.log('⏳ Waiting for content to load...');
  await page.waitForTimeout(15000); // Wait for AI to generate

  // Test main-col selector
  const mainColResults = await page.evaluate(() => {
    const mainCol = document.querySelector('[data-container-id="main-col"]');
    
    if (!mainCol) {
      return { exists: false, message: 'main-col container not found' };
    }

    console.log('✅ main-col container found!');
    
    if (mainCol.children.length === 0) {
      return { exists: true, children: 0, message: 'main-col exists but has no children' };
    }

    const firstChild = mainCol.children[0];
    const content = firstChild.textContent || '';
    
    return {
      exists: true,
      children: mainCol.children.length,
      firstChildTag: firstChild.tagName.toLowerCase(),
      firstChildContent: content.substring(0, 500) + (content.length > 500 ? '...' : ''),
      contentLength: content.length,
      message: `main-col has ${mainCol.children.length} children, first child has ${content.length} chars`
    };
  });

  console.log('\n📊 MAIN-COL TEST RESULTS:');
  console.log('========================');
  console.log('main-col exists:', mainColResults.exists ? '✅' : '❌');
  console.log('Message:', mainColResults.message);
  
  if (mainColResults.exists && mainColResults.children > 0) {
    console.log('Children count:', mainColResults.children);
    console.log('First child tag:', mainColResults.firstChildTag);
    console.log('First child content length:', mainColResults.contentLength);
    console.log('\n📄 First child content preview:');
    console.log(mainColResults.firstChildContent);
    
    if (mainColResults.contentLength > 500) {
      console.log('\n🎯 CONCLUSION: main-col approach looks viable!');
      console.log('✅ main-col container exists');
      console.log('✅ Has children elements');
      console.log('✅ First child has substantial content');
      console.log('\n➡️ Recommendation: Proceed with main-col implementation');
    } else {
      console.log('\n⚠️ CONCLUSION: main-col may not be reliable');
      console.log('❌ First child content is too short');
    }
  }

  await browser.close();
}

// Run the test
quickMainColTest().catch(console.error);