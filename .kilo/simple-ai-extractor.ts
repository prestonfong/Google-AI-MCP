import { chromium, Browser, Page, BrowserContext } from 'playwright';

/**
 * Simplified Google AI Search Extractor
 * Based on debug findings, targets the correct selectors without complex processing
 */
export class SimpleAIExtractor {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;

  constructor() {}

  /**
   * Wait for AI generation to complete by monitoring for completion indicators
   */
  private async waitForAICompletion(page: Page): Promise<void> {
    const maxWaitTime = 60000; // 60 seconds max
    const checkInterval = 1000; // Check every 1 second
    const startTime = Date.now();

    console.log('⏳ Monitoring AI response generation...');

    while (Date.now() - startTime < maxWaitTime) {
      try {
        // Check for completion indicators
        const isComplete = await page.evaluate(() => {
          // Look for "Thinking" text - if it's gone, AI is likely done
          const thinkingElements = document.querySelectorAll('*');
          let hasThinking = false;
          
          for (const element of thinkingElements) {
            const text = element.textContent || '';
            if (text.includes('Thinking') || text.includes('Looking at') || text.includes('Kicking off')) {
              hasThinking = true;
              break;
            }
          }
          
          // Look for substantial content in the AI response area
          const aiContainers = document.querySelectorAll('div[jsname="htVhGf"], div[jsname="RH7zg"]');
          let hasSubstantialContent = false;
          
          for (const container of aiContainers) {
            const content = container.textContent || '';
            // Check for comprehensive content structure
            if (content.length > 1000 && !content.includes('Thinking')) {
              hasSubstantialContent = true;
              break;
            }
          }
          
          // AI is complete if we have substantial content and no "thinking" indicators
          return !hasThinking && hasSubstantialContent;
        });

        if (isComplete) {
          console.log('✅ AI response generation completed');
          return;
        }

        // Wait before next check
        await page.waitForTimeout(checkInterval);
        
        // Log progress every 5 seconds
        if ((Date.now() - startTime) % 5000 < checkInterval) {
          console.log(`⏳ Still waiting... ${Math.floor((Date.now() - startTime) / 1000)}s elapsed`);
        }

      } catch (error) {
        console.log('⚠️ Error checking AI completion, continuing...');
      }
    }

    console.log('⏰ Max wait time reached, proceeding with current content');
  }

  private async initBrowser(): Promise<void> {
    if (this.browser) return;

    this.browser = await chromium.launch({
      headless: false,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-first-run',
        '--disable-default-apps'
      ]
    });

    this.context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US'
    });
  }

  async extractAIResponse(query: string): Promise<{ success: boolean; content?: string; error?: string }> {
    console.log(`🔍 Simple AI extraction for: "${query}"`);
    
    try {
      await this.initBrowser();
      if (!this.context) throw new Error('Browser context failed');

      const page = await this.context.newPage();
      
      const searchUrl = `https://www.google.com/search?authuser=0&udm=50&aep=25&hl=en&source=searchlabs&q=${encodeURIComponent(query)}`;
      console.log(`🌐 Navigating to: ${searchUrl}`);
      
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);

      // Handle cookie consent
      try {
        const acceptButton = await page.$('button:has-text("Accept all"), button:has-text("I agree"), #L2AGLb');
        if (acceptButton) {
          await acceptButton.click();
          await page.waitForTimeout(1000);
        }
      } catch (error) {
        // Ignore
      }

      console.log('🤖 Waiting for AI to finish generating response...');
      
      // Wait for AI generation to complete
      await this.waitForAICompletion(page);

      // Target the specific selectors we identified
      const aiSelectors = [
        'div[jsname="htVhGf"]',
        'div[jsname="RH7zg"]',
        '.qJYHHd.maIobf',
        '.tonYlb'
      ];

      for (const selector of aiSelectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            // Extract the complete AI response content
            const aiContent = await page.evaluate((sel) => {
              const container = document.querySelector(sel);
              if (!container) return null;

              // Remove script tags and their content
              const scripts = container.querySelectorAll('script');
              scripts.forEach(script => script.remove());

              // Get clean text content
              let content = container.textContent || '';
              
              // Clean up the content while preserving structure
              content = content
                // Remove UI navigation text
                .replace(/^.*?climate change effects\s*/i, '')
                .replace(/^.*?Thinking\s*/, '')
                .replace(/^.*?Kicking off \d+ search(es)?\s*/, '')
                .replace(/^.*?Looking at \d+ sites?\s*/, '')
                .replace(/^.*?Putting it all together\s*/, '')
                
                // Remove JavaScript code blocks
                .replace(/\(function\(\).*?\}\)\(\);?/gs, '')
                .replace(/var\s+\w+.*?;/g, '')
                .replace(/function\s+\w+\([^)]*\)\s*{.*?}/gs, '')
                .replace(/\w+\s*=\s*function\([^)]*\)\s*{.*?};?/gs, '')
                
                // Clean up multiple whitespace but preserve paragraph breaks
                .replace(/\s*\n\s*/g, '\n')
                .replace(/\s+/g, ' ')
                .replace(/\n\s+/g, '\n')
                .trim();

              // Only return if we have substantial content with climate change info
              if (content.length > 500 && content.toLowerCase().includes('climate change')) {
                return content;
              }
              
              return null;
            }, selector);

            if (aiContent && aiContent.length > 200) {
              console.log(`✅ Found AI content with ${selector}`);
              console.log(`📏 Content length: ${aiContent.length}`);
              console.log(`📄 Preview: ${aiContent.substring(0, 300)}...`);
              
              await page.close();
              return { success: true, content: aiContent };
            }
          }
        } catch (error) {
          continue;
        }
      }

      await page.close();
      return { success: false, error: 'No AI content found with any selector' };
      
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async close(): Promise<void> {
    if (this.context) {
      await this.context.close();
      this.context = null;
    }
    
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

// Test the simple extractor
async function testSimpleExtractor() {
  const query = process.argv[2] || 'climate change effects';
  console.log(`🚀 Testing simple extractor with: "${query}"`);
  
  const extractor = new SimpleAIExtractor();
  
  try {
    const result = await extractor.extractAIResponse(query);
    
    if (result.success) {
      console.log('\n✅ SUCCESS! AI content extracted:');
      console.log('='.repeat(80));
      console.log(result.content);
      console.log('='.repeat(80));
    } else {
      console.log('\n❌ FAILED:', result.error);
    }
  } finally {
    await extractor.close();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testSimpleExtractor().catch(console.error);
}