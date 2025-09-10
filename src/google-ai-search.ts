import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { GoogleAISearchResult, SearchOptions } from './types.js';

export class GoogleAISearchExtractor {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;

  constructor() {}

  private async initBrowser(options: SearchOptions = {}): Promise<void> {
    if (this.browser) {
      return;
    }

    this.browser = await chromium.launch({
      headless: false,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-first-run',
        '--disable-default-apps',
        '--window-position=-2000,-2000',
        '--window-size=1,1',
        '--start-minimized'
      ]
    });

    this.context = await this.browser.newContext({
      userAgent: options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1024, height: 600 },
      locale: 'en-US',
      ignoreHTTPSErrors: true
    });
  }

  async searchAIContent(query: string, options: SearchOptions = {}): Promise<GoogleAISearchResult> {
    try {
      await this.initBrowser(options);
      
      if (!this.context) {
        throw new Error('Failed to initialize browser context');
      }

      const page = await this.context.newPage();
      
      await page.addInitScript(() => {
        delete (window as any).navigator.webdriver;
        (window as any).chrome = { runtime: {} };
      });

      const searchUrl = `https://www.google.com/search?authuser=0&udm=50&aep=25&hl=en&source=searchlabs&q=${encodeURIComponent(query)}`;
      await page.goto(searchUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });
      
      try {
        const acceptButton = await page.$('button:has-text("Accept all"), button:has-text("I agree"), #L2AGLb');
        if (acceptButton) {
          await acceptButton.click();
        }
      } catch (error) {
        // Ignore cookie errors
      }

      await this.waitForPageStability(page);

      const aiContent = await page.evaluate(() => {
        const mainCol = document.querySelector('[data-container-id="main-col"]');
        if (!mainCol) return null;
        
        const firstChild = mainCol.firstElementChild;
        if (!firstChild) return null;
        
        let content = firstChild.textContent?.trim() || null;
        
        if (content) {
          content = content
            .replace(/AI responses may include mistakes\..*?Close\s*$/s, '')
            .replace(/Learn more.*?Close\s*$/s, '')
            .replace(/Thank you.*?Close\s*$/s, '')
            .replace(/Your feedback helps Google improve\..*?Close\s*$/s, '')
            .replace(/See our Privacy Policy\..*?Close\s*$/s, '')
            .replace(/Share more feedback.*?Close\s*$/s, '')
            .replace(/Report a problem.*?Close\s*$/s, '')
            .trim();
        }
        
        return content;
      });

      if (!aiContent || aiContent.length < 100) {
        throw new Error('No substantial AI content found in main-col first child');
      }
      
      await page.close();

      return {
        success: true,
        query,
        aiResponse: {
          text: aiContent,
          sources: undefined
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        query,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      };
    }
  }

  private async waitForPageStability(page: Page): Promise<void> {
    const stabilityDuration = 2000;
    const checkInterval = 500;
    const maxWaitTime = 30000;
    const startTime = Date.now();

    let previousContent = '';
    let lastChangeTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      try {
        const currentContent = await page.evaluate(() => {
          const mainCol = document.querySelector('[data-container-id="main-col"]');
          if (!mainCol) return '';
          
          const firstChild = mainCol.firstElementChild;
          if (!firstChild) return '';
          
          return firstChild.textContent?.trim() || '';
        });

        if (currentContent !== previousContent) {
          previousContent = currentContent;
          lastChangeTime = Date.now();
        }

        const timeSinceLastChange = Date.now() - lastChangeTime;
        if (timeSinceLastChange >= stabilityDuration && currentContent.length > 100) {
          return;
        }

        await page.waitForTimeout(checkInterval);
        
      } catch (error) {
        await page.waitForTimeout(checkInterval);
      }
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

export async function getGoogleAISearchResponses(
  queries: string[],
  options: SearchOptions = {}
): Promise<GoogleAISearchResult[]> {
  const extractors = queries.map(() => new GoogleAISearchExtractor());
  
  try {
    const results = await Promise.all(
      queries.map((query, index) =>
        extractors[index].searchAIContent(query, options)
      )
    );
    
    return results;
  } finally {
    await Promise.all(extractors.map(extractor => extractor.close()));
  }
}

export async function getGoogleAISearchResponse(
  query: string,
  options: SearchOptions = {}
): Promise<GoogleAISearchResult> {
  const extractor = new GoogleAISearchExtractor();
  
  try {
    return await extractor.searchAIContent(query, options);
  } finally {
    await extractor.close();
  }
}