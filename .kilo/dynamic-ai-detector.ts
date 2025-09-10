import { chromium, Browser, Page, BrowserContext } from 'playwright';

/**
 * Experimental Dynamic AI Container Detection
 * Finds AI containers based on content patterns and structure rather than hardcoded selectors
 */
export class DynamicAIDetector {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;

  constructor() {}

  private async initBrowser(): Promise<void> {
    if (this.browser) return;

    this.browser = await chromium.launch({
      headless: true,
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

  /**
   * Dynamically find AI containers based on content characteristics
   */
  async findAIContainers(query: string): Promise<void> {
    try {
      await this.initBrowser();
      if (!this.context) throw new Error('Browser context failed');

      const page = await this.context.newPage();
      
      const searchUrl = `https://www.google.com/search?authuser=0&udm=50&aep=25&hl=en&source=searchlabs&q=${encodeURIComponent(query)}`;
      console.log(`🌐 Navigating to: ${searchUrl}`);
      
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(5000); // Wait for initial load

      // Handle cookie consent
      try {
        const acceptButton = await page.$('button:has-text("Accept all"), button:has-text("I agree"), #L2AGLb');
        if (acceptButton) {
          await acceptButton.click();
          await page.waitForTimeout(2000);
        }
      } catch (error) {
        // Ignore
      }

      console.log('🔍 Analyzing page structure for AI containers...');

      // Wait for AI content to start appearing with progress updates
      for (let i = 0; i < 10; i++) {
        await page.waitForTimeout(1000);
        console.log(`⏳ Waiting for AI content... ${i + 1}/10 seconds`);
      }

      const aiContainers = await page.evaluate((searchQuery) => {
        const results: Array<{
          selector: string;
          contentLength: number;
          contentPreview: string;
          confidence: number;
          reasons: string[];
          element: {
            tagName: string;
            id: string;
            className: string;
            attributes: Record<string, string>;
          };
        }> = [];

        // Get all divs with substantial content
        const allDivs = document.querySelectorAll('div');
        
        for (let i = 0; i < allDivs.length; i++) {
          const div = allDivs[i];
          const content = div.textContent || '';
          
          // Skip if content is too short
          if (content.length < 500) continue;
          
          // Skip if it's likely a wrapper (has many child divs)
          const childDivs = div.querySelectorAll('div').length;
          const directChildDivs = Array.from(div.children).filter(child => child.tagName === 'DIV').length;
          if (directChildDivs > 10) continue;
          
          let confidence = 0;
          const reasons: string[] = [];
          
          // Check for AI-specific content patterns
          const lowerContent = content.toLowerCase();
          
          // High confidence indicators
          if (lowerContent.includes(searchQuery.toLowerCase()) && content.length > 1000) {
            confidence += 40;
            reasons.push(`Contains search query "${searchQuery}" with substantial content`);
          }
          
          if (lowerContent.includes('climate change') && lowerContent.includes('effects')) {
            confidence += 30;
            reasons.push('Contains relevant topic keywords');
          }
          
          // AI response patterns
          if (lowerContent.includes('according to') || lowerContent.includes('based on')) {
            confidence += 20;
            reasons.push('Contains AI attribution patterns');
          }
          
          // Structural content indicators
          if (lowerContent.includes('temperature') && lowerContent.includes('environment')) {
            confidence += 15;
            reasons.push('Contains expected topic-specific terms');
          }
          
          // Check for comprehensive content structure
          if (content.length > 2000 && content.split('.').length > 10) {
            confidence += 25;
            reasons.push('Has comprehensive paragraph structure');
          }
          
          // Avoid navigation/UI elements
          if (lowerContent.includes('search') && lowerContent.includes('images') && lowerContent.includes('videos')) {
            confidence -= 50;
            reasons.push('Likely navigation element (PENALTY)');
          }
          
          if (lowerContent.includes('cookie') || lowerContent.includes('privacy policy')) {
            confidence -= 30;
            reasons.push('Likely UI/legal element (PENALTY)');
          }
          
          // Only include elements with reasonable confidence
          if (confidence > 20) {
            // Generate a robust selector
            let selector = div.tagName.toLowerCase();
            
            // Add ID if available
            if (div.id) {
              selector += `#${div.id}`;
            }
            
            // Add unique classes
            if (div.className) {
              const classes = div.className.trim().split(/\s+/);
              const uniqueClasses = classes.filter(cls => 
                cls.length > 2 && 
                !cls.match(/^[a-zA-Z]\d+$/) && // Avoid generated classes like 'a1', 'b2'
                !cls.includes('-')
              );
              if (uniqueClasses.length > 0) {
                selector += `.${uniqueClasses.join('.')}`;
              }
            }
            
            // Add custom attributes that might be useful
            const attributes: Record<string, string> = {};
            for (const attr of div.attributes) {
              if (attr.name.startsWith('data-') || attr.name === 'role' || attr.name === 'jsname') {
                attributes[attr.name] = attr.value;
                if (attr.name === 'jsname' || attr.name === 'data-ved') {
                  selector += `[${attr.name}="${attr.value}"]`;
                  confidence += 10;
                  reasons.push(`Has specific attribute: ${attr.name}="${attr.value}"`);
                }
              }
            }
            
            results.push({
              selector: selector,
              contentLength: content.length,
              contentPreview: content.substring(0, 200) + '...',
              confidence: confidence,
              reasons: reasons,
              element: {
                tagName: div.tagName,
                id: div.id || '',
                className: div.className || '',
                attributes: attributes
              }
            });
          }
        }
        
        // Sort by confidence
        return results.sort((a, b) => b.confidence - a.confidence);
      }, query);

      console.log('\n🎯 Dynamic AI Container Detection Results:');
      console.log('==========================================');
      
      aiContainers.forEach((container, index) => {
        console.log(`\n${index + 1}. Confidence: ${container.confidence}%`);
        console.log(`   Selector: ${container.selector}`);
        console.log(`   Content Length: ${container.contentLength}`);
        console.log(`   Reasons: ${container.reasons.join(', ')}`);
        console.log(`   Element: <${container.element.tagName}${container.element.id ? ` id="${container.element.id}"` : ''}${container.element.className ? ` class="${container.element.className}"` : ''}>`);
        console.log(`   Attributes: ${JSON.stringify(container.element.attributes)}`);
        console.log(`   Preview: ${container.contentPreview}`);
      });

      if (aiContainers.length === 0) {
        console.log('\n❌ No AI containers found with sufficient confidence');
      } else {
        console.log(`\n✅ Found ${aiContainers.length} potential AI containers`);
        console.log(`🏆 Top candidate: ${aiContainers[0].selector} (${aiContainers[0].confidence}% confidence)`);
      }

      await page.close();
      
    } catch (error) {
      console.error('Error during dynamic detection:', error);
    } finally {
      await this.close();
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

// Test the dynamic detector
async function testDynamicDetection() {
  console.log('🧪 Testing Dynamic AI Container Detection');
  console.log('========================================');
  
  const detector = new DynamicAIDetector();
  await detector.findAIContainers('climate change effects');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testDynamicDetection().catch(console.error);
}