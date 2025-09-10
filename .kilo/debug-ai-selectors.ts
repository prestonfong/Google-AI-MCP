import { chromium, Browser, Page, BrowserContext } from 'playwright';

/**
 * Debug tool to investigate Google AI Search webpage structure
 * and identify correct selectors for AI overview content
 */
export class AISearchDebugger {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;

  constructor() {}

  private async initBrowser(): Promise<void> {
    if (this.browser) {
      return;
    }

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

  async debugQuery(query: string): Promise<void> {
    console.log(`🔍 Debug Analysis for: "${query}"`);
    console.log('=' .repeat(80));
    
    try {
      await this.initBrowser();
      
      if (!this.context) {
        throw new Error('Failed to initialize browser context');
      }

      const page = await this.context.newPage();
      
      const searchUrl = `https://www.google.com/search?authuser=0&udm=50&aep=25&hl=en&source=searchlabs&q=${encodeURIComponent(query)}`;
      console.log(`🌐 Navigating to: ${searchUrl}`);
      
      await page.goto(searchUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });
      
      // Wait for page to stabilize
      await page.waitForTimeout(3000);

      // Handle cookie consent
      try {
        const acceptButton = await page.$('button:has-text("Accept all"), button:has-text("I agree"), #L2AGLb');
        if (acceptButton) {
          await acceptButton.click();
          await page.waitForTimeout(1000);
        }
      } catch (error) {
        // Ignore cookie errors
      }

      console.log('\n📊 WEBPAGE ANALYSIS');
      console.log('=' .repeat(40));

      // 1. Find all potential AI overview containers
      await this.analyzeAIContainers(page);

      // 2. Scan for elements with substantial content
      await this.analyzeContentElements(page);

      // 3. Look for specific AI-related attributes
      await this.analyzeAIAttributes(page);

      // 4. Test extraction approaches
      await this.testExtractionApproaches(page);

      await page.close();

    } catch (error) {
      console.error('❌ Debug analysis failed:', error);
    }
  }

  private async analyzeAIContainers(page: Page): Promise<void> {
    console.log('\n🎯 AI CONTAINER ANALYSIS');
    console.log('-' .repeat(30));

    const potentialSelectors = [
      // Common AI overview selectors
      '[data-attrid*="AI"]',
      '[data-attrid*="ai"]', 
      '[data-attrid*="overview"]',
      '[data-ved*="AI"]',
      '[data-hveid*="AI"]',
      '.AI7Qof',
      '.oST1qe', 
      '.yKMVIe',
      '.c2xzTb',
      '.MBeuO',
      '.NJjxre',
      '.ULSxyf',
      '.kp-wholepage',
      '.g-blk',
      
      // Look for divs that might contain overview
      'div[role="complementary"]',
      'div[data-async-context*="ai"]',
      'div[data-async-context*="overview"]',
      '.xpdopen',
      '.wp-ms',
      '.kno-rdesc',
      '.X5LH0c'
    ];

    for (const selector of potentialSelectors) {
      try {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          console.log(`\n✅ Found ${elements.length} element(s) with selector: ${selector}`);
          
          for (let i = 0; i < Math.min(elements.length, 3); i++) {
            const element = elements[i];
            const content = await element.textContent();
            const innerHTML = await element.innerHTML();
            
            if (content && content.trim().length > 100) {
              console.log(`  📝 Element ${i + 1} content length: ${content.trim().length}`);
              console.log(`  📄 Preview: ${content.trim().substring(0, 200)}...`);
              console.log(`  🔧 HTML structure: ${innerHTML.substring(0, 150)}...`);
              
              // Check if this looks like climate change content
              if (content.toLowerCase().includes('climate change') && content.length > 500) {
                console.log(`  🎯 POTENTIAL MATCH: This element contains substantial climate change content!`);
              }
            }
          }
        }
      } catch (error) {
        // Skip invalid selectors
      }
    }
  }

  private async analyzeContentElements(page: Page): Promise<void> {
    console.log('\n📏 CONTENT LENGTH ANALYSIS');
    console.log('-' .repeat(30));

    // Find all divs with substantial content
    const contentAnalysis = await page.evaluate(() => {
      const allDivs = document.querySelectorAll('div');
      const analysis: Array<{
        selector: string;
        length: number;
        preview: string;
        classes: string[];
        dataAttribs: string[];
      }> = [];

      allDivs.forEach((div, index) => {
        const content = div.textContent?.trim() || '';
        if (content.length > 300) {
          analysis.push({
            selector: `div:nth-child(${index + 1})`,
            length: content.length,
            preview: content.substring(0, 150),
            classes: Array.from(div.classList),
            dataAttribs: Array.from(div.attributes)
              .filter(attr => attr.name.startsWith('data-'))
              .map(attr => `${attr.name}="${attr.value}"`)
          });
        }
      });

      return analysis.sort((a, b) => b.length - a.length).slice(0, 10);
    });

    console.log('\n🔝 Top 10 elements by content length:');
    contentAnalysis.forEach((item, index) => {
      console.log(`\n${index + 1}. Content Length: ${item.length}`);
      console.log(`   Classes: [${item.classes.join(', ')}]`);
      console.log(`   Data Attributes: [${item.dataAttribs.join(', ')}]`);
      console.log(`   Preview: ${item.preview}...`);
      
      if (item.preview.toLowerCase().includes('climate change')) {
        console.log(`   🎯 CLIMATE CHANGE MATCH FOUND!`);
      }
    });
  }

  private async analyzeAIAttributes(page: Page): Promise<void> {
    console.log('\n🔍 AI-SPECIFIC ATTRIBUTES ANALYSIS');
    console.log('-' .repeat(30));

    const aiAttributeAnalysis = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      const results: Array<{
        tagName: string;
        attributes: string[];
        contentLength: number;
        preview: string;
      }> = [];

      allElements.forEach(element => {
        const hasAIAttribute = Array.from(element.attributes).some(attr => 
          attr.name.toLowerCase().includes('ai') || 
          attr.value.toLowerCase().includes('ai') ||
          attr.value.toLowerCase().includes('overview')
        );

        if (hasAIAttribute) {
          const content = element.textContent?.trim() || '';
          if (content.length > 50) {
            results.push({
              tagName: element.tagName,
              attributes: Array.from(element.attributes).map(attr => `${attr.name}="${attr.value}"`),
              contentLength: content.length,
              preview: content.substring(0, 100)
            });
          }
        }
      });

      return results.sort((a, b) => b.contentLength - a.contentLength);
    });

    console.log('\nElements with AI-related attributes:');
    aiAttributeAnalysis.forEach((item, index) => {
      if (index < 5) { // Show top 5
        console.log(`\n${index + 1}. Tag: ${item.tagName}, Length: ${item.contentLength}`);
        console.log(`   Attributes: ${item.attributes.join(', ')}`);
        console.log(`   Preview: ${item.preview}...`);
      }
    });
  }

  private async testExtractionApproaches(page: Page): Promise<void> {
    console.log('\n🧪 EXTRACTION TESTING');
    console.log('-' .repeat(30));

    // Test different extraction strategies
    const testSelectors = [
      'div[data-attrid*="AI"]',
      'div[data-attrid*="overview"]',
      '.kp-wholepage',
      '.g-blk',
      '.xpdopen',
      'div[jsname="htVhGf"]',
      'div[jsname="RH7zg"]',
      '.qJYHHd.maIobf',
      '.tonYlb.ZKmnA'
    ];

    for (const selector of testSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const content = await element.textContent();
          if (content && content.trim().length > 200) {
            console.log(`\n✅ Test extraction with ${selector}:`);
            console.log(`   Length: ${content.trim().length}`);
            console.log(`   Contains climate keywords: ${content.toLowerCase().includes('climate change')}`);
            
            if (content.toLowerCase().includes('environmental effects') ||
                content.toLowerCase().includes('effects on humans') ||
                content.toLowerCase().includes('rising global temperatures') ||
                content.toLowerCase().includes('melting ice')) {
              console.log(`   🎯 STRONG MATCH: Contains structured sections!`);
              console.log(`   Sample content:\n${content.trim().substring(0, 800)}...`);
              
              // Check for comprehensive content structure
              if (content.includes('Environmental effects') && content.includes('Effects on humans')) {
                console.log(`   🚀 JACKPOT: This appears to be the main AI overview!`);
                console.log(`   Full content preview:\n${content.trim().substring(0, 1500)}...`);
              }
            }
          }
        }
      } catch (error) {
        // Skip
      }
    }

    // Test one more approach - look for divs that contain the expected content structure
    console.log('\n🔍 SEARCHING FOR FULL AI OVERVIEW STRUCTURE:');
    
    try {
      const structuredContent = await page.evaluate(() => {
        const allDivs = document.querySelectorAll('div');
        for (const div of allDivs) {
          const text = div.textContent || '';
          if (text.includes('Climate change is causing') &&
              text.includes('Environmental effects') &&
              text.includes('Effects on humans and society') &&
              text.length > 2000) {
            return {
              found: true,
              content: text.substring(0, 2000),
              classes: Array.from(div.classList),
              attributes: Array.from(div.attributes).map(attr => `${attr.name}="${attr.value}"`).slice(0, 10)
            };
          }
        }
        return { found: false };
      });

      if (structuredContent.found) {
        console.log('🎯 FOUND THE FULL AI OVERVIEW!');
        console.log(`   Classes: [${structuredContent.classes.join(', ')}]`);
        console.log(`   Attributes: [${structuredContent.attributes.join(', ')}]`);
        console.log(`   Content preview:\n${structuredContent.content}...`);
      } else {
        console.log('❌ Full AI overview structure not found with current approach');
      }
    } catch (error) {
      console.log('❌ Error during structured content search:', error);
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

// CLI interface for debugging
async function main() {
  const query = process.argv[2] || 'climate change effects';
  const debugTool = new AISearchDebugger();
  
  try {
    await debugTool.debugQuery(query);
  } finally {
    await debugTool.close();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}