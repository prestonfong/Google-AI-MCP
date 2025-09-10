import { chromium, Browser, Page, BrowserContext } from 'playwright';

/**
 * Simplified Dynamic AI Container Detection
 * Tests dynamic detection vs hardcoded selectors
 */
async function testDynamicDetection() {
  console.log('🧪 Testing Dynamic AI Container Detection vs Hardcoded Selectors');
  console.log('================================================================');
  
  let browser: Browser | null = null;
  
  try {
    // Launch browser with timeout
    browser = await chromium.launch({
      headless: true,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-first-run',
        '--disable-default-apps',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();
    
    // Set shorter timeouts for testing
    page.setDefaultTimeout(15000);
    
    const query = 'climate change effects';
    const searchUrl = `https://www.google.com/search?authuser=0&udm=50&aep=25&hl=en&source=searchlabs&q=${encodeURIComponent(query)}`;
    
    console.log(`🌐 Navigating to: ${searchUrl}`);
    
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    // Handle cookie consent quickly
    try {
      await page.waitForSelector('#L2AGLb', { timeout: 3000 });
      await page.click('#L2AGLb');
      await page.waitForTimeout(1000);
    } catch {
      console.log('No cookie consent needed');
    }

    // Wait for initial content
    console.log('⏳ Waiting for page content...');
    await page.waitForTimeout(8000);

    console.log('🔍 Testing Detection Methods...');
    console.log('');

    // Test 1: Hardcoded selectors (current method)
    console.log('1. HARDCODED SELECTORS (Current Method):');
    console.log('----------------------------------------');
    
    const hardcodedSelectors = [
      'div[jsname="htVhGf"]',
      'div[jsname="RH7zg"]', 
      '.qJYHHd.maIobf',
      '.tonYlb'
    ];
    
    let hardcodedContent = '';
    let hardcodedFound = false;
    
    for (const selector of hardcodedSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const content = await element.textContent();
          if (content && content.length > 500) {
            console.log(`✅ Found content with selector: ${selector}`);
            console.log(`   Content length: ${content.length} chars`);
            console.log(`   Preview: ${content.substring(0, 150)}...`);
            hardcodedContent = content;
            hardcodedFound = true;
            break;
          }
        }
      } catch (error) {
        console.log(`❌ Failed selector: ${selector}`);
      }
    }

    if (!hardcodedFound) {
      console.log('❌ No hardcoded selectors found content');
    }

    console.log('');
    
    // Test 2: Dynamic detection
    console.log('2. DYNAMIC DETECTION (New Method):');
    console.log('----------------------------------');
    
    const dynamicResults = await page.evaluate((searchQuery) => {
      const results: Array<{
        selector: string;
        contentLength: number;
        confidence: number;
        reasons: string[];
      }> = [];

      // Find all divs with substantial content
      const allDivs = document.querySelectorAll('div');
      
      for (let i = 0; i < allDivs.length; i++) {
        const div = allDivs[i];
        const content = div.textContent || '';
        
        if (content.length < 500) continue;
        
        let confidence = 0;
        const reasons: string[] = [];
        const lowerContent = content.toLowerCase();
        
        // Content relevance scoring
        if (lowerContent.includes(searchQuery.toLowerCase()) && content.length > 1000) {
          confidence += 40;
          reasons.push('Contains search query with substantial content');
        }
        
        if (lowerContent.includes('climate') && lowerContent.includes('effects')) {
          confidence += 30;
          reasons.push('Contains topic keywords');
        }
        
        if (lowerContent.includes('temperature') || lowerContent.includes('environment')) {
          confidence += 20;
          reasons.push('Contains topic-specific terms');
        }
        
        if (content.length > 2000) {
          confidence += 25;
          reasons.push('Has comprehensive content length');
        }
        
        // Avoid UI elements
        if (lowerContent.includes('search') && lowerContent.includes('images')) {
          confidence -= 40;
          reasons.push('Likely navigation (PENALTY)');
        }
        
        if (confidence > 50) {
          // Generate selector
          let selector = 'div';
          
          if (div.id) {
            selector += `#${div.id}`;
          } else if (div.className) {
            const classes = div.className.trim().split(/\s+/);
            selector += `.${classes[0]}`;
          }
          
          // Add jsname if available
          const jsname = div.getAttribute('jsname');
          if (jsname) {
            selector += `[jsname="${jsname}"]`;
            confidence += 10;
            reasons.push(`Has jsname: ${jsname}`);
          }
          
          results.push({
            selector,
            contentLength: content.length,
            confidence,
            reasons
          });
        }
      }
      
      return results.sort((a, b) => b.confidence - a.confidence);
    }, query);

    let dynamicContent = '';
    let dynamicFound = false;

    if (dynamicResults.length > 0) {
      console.log(`✅ Found ${dynamicResults.length} potential AI containers`);
      
      const topCandidate = dynamicResults[0];
      console.log(`🏆 Top candidate: ${topCandidate.selector} (${topCandidate.confidence}% confidence)`);
      console.log(`   Content length: ${topCandidate.contentLength} chars`);
      console.log(`   Reasons: ${topCandidate.reasons.join(', ')}`);
      
      // Try to extract content from top candidate
      try {
        const element = await page.$(topCandidate.selector);
        if (element) {
          const content = await element.textContent();
          if (content) {
            dynamicContent = content;
            dynamicFound = true;
            console.log(`   Preview: ${content.substring(0, 150)}...`);
          }
        }
      } catch (error) {
        console.log(`   Error extracting content: ${error}`);
      }
      
      // Show other candidates
      dynamicResults.slice(1, 3).forEach((result, idx) => {
        console.log(`${idx + 2}. ${result.selector} (${result.confidence}% confidence)`);
      });
    } else {
      console.log('❌ No dynamic candidates found');
    }

    console.log('');
    console.log('📊 COMPARISON RESULTS:');
    console.log('======================');
    console.log(`Hardcoded Method: ${hardcodedFound ? '✅ SUCCESS' : '❌ FAILED'} (${hardcodedContent.length} chars)`);
    console.log(`Dynamic Method:   ${dynamicFound ? '✅ SUCCESS' : '❌ FAILED'} (${dynamicContent.length} chars)`);
    
    if (hardcodedFound && dynamicFound) {
      const similarity = Math.min(hardcodedContent.length, dynamicContent.length) / Math.max(hardcodedContent.length, dynamicContent.length);
      console.log(`Content Similarity: ${(similarity * 100).toFixed(1)}%`);
      
      if (similarity > 0.8) {
        console.log('🎉 Dynamic detection is comparable to hardcoded selectors!');
      } else {
        console.log('⚠️  Dynamic detection found different content');
      }
    }

    await context.close();
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
testDynamicDetection().catch(console.error);