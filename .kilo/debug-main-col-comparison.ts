/**
 * Debug Script: Compare main-col selector with current heuristic results
 * This will test if data-container-id="main-col" first child is always the AI content
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { HeuristicAIDetector } from '../ai-search/src/heuristic-ai-detector';

interface ComparisonResult {
  query: string;
  mainColExists: boolean;
  mainColFirstChild: {
    content: string;
    length: number;
    tagName: string;
    selector: string;
  } | null;
  heuristicResult: {
    content: string;
    length: number;
    selector: string;
    confidence: number;
  } | null;
  contentMatch: boolean;
  analysis: string;
}

class MainColDebugger {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;

  async initBrowser(): Promise<void> {
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
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1024, height: 600 },
      locale: 'en-US'
    });
  }

  async debugQuery(query: string): Promise<ComparisonResult> {
    console.log(`\n🔍 Debugging Query: "${query}"`);
    
    const page = await this.context!.newPage();
    
    // Remove automation indicators
    await page.addInitScript(() => {
      delete (window as any).navigator.webdriver;
      (window as any).chrome = { runtime: {} };
    });

    const searchUrl = `https://www.google.com/search?authuser=0&udm=50&aep=25&hl=en&source=searchlabs&q=${encodeURIComponent(query)}`;
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Handle cookie consent
    try {
      const acceptButton = await page.$('button:has-text("Accept all"), button:has-text("I agree"), #L2AGLb');
      if (acceptButton) await acceptButton.click();
    } catch (error) {
      // Ignore cookie errors
    }

    // Wait for AI completion (simplified version)
    console.log('⏳ Waiting for AI content to load...');
    await this.waitForAICompletion(page);

    // Test main-col approach
    const mainColResult = await this.testMainColApproach(page);
    
    // Test current heuristic approach
    const heuristicResult = await this.testHeuristicApproach(page, query);

    await page.close();

    // Compare results
    const comparison: ComparisonResult = {
      query,
      mainColExists: mainColResult !== null,
      mainColFirstChild: mainColResult,
      heuristicResult,
      contentMatch: this.compareContent(mainColResult?.content, heuristicResult?.content),
      analysis: this.analyzeResults(mainColResult, heuristicResult)
    };

    return comparison;
  }

  private async waitForAICompletion(page: Page): Promise<void> {
    const maxWaitTime = 30000; // 30 seconds max
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const hasContent = await page.evaluate(() => {
        const mainCol = document.querySelector('[data-container-id="main-col"]');
        if (mainCol && mainCol.children.length > 0) {
          const firstChild = mainCol.children[0];
          const content = firstChild.textContent || '';
          return content.length > 500; // Has substantial content
        }
        return false;
      });

      if (hasContent) {
        console.log('✅ AI content detected');
        return;
      }

      await page.waitForTimeout(1000);
    }
    
    console.log('⚠️ Timeout waiting for AI content, proceeding...');
  }

  private async testMainColApproach(page: Page): Promise<ComparisonResult['mainColFirstChild']> {
    console.log('🧪 Testing main-col approach...');
    
    const result = await page.evaluate(() => {
      const mainCol = document.querySelector('[data-container-id="main-col"]');
      
      if (!mainCol) {
        console.log('❌ main-col container not found');
        return null;
      }

      if (mainCol.children.length === 0) {
        console.log('❌ main-col has no children');
        return null;
      }

      const firstChild = mainCol.children[0];
      const content = firstChild.textContent || '';
      
      // Generate a selector for the first child
      let selector = `[data-container-id="main-col"] > ${firstChild.tagName.toLowerCase()}`;
      if (firstChild.className) {
        const classes = firstChild.className.toString().trim().split(/\s+/);
        const meaningfulClass = classes.find(cls => cls.length > 2 && !cls.match(/^[a-zA-Z]\d+$/));
        if (meaningfulClass) {
          selector += `.${meaningfulClass}`;
        }
      }

      return {
        content,
        length: content.length,
        tagName: firstChild.tagName.toLowerCase(),
        selector
      };
    });

    if (result) {
      console.log(`✅ main-col first child found: ${result.tagName}, ${result.length} chars`);
    } else {
      console.log('❌ main-col approach failed');
    }

    return result;
  }

  private async testHeuristicApproach(page: Page, query: string): Promise<ComparisonResult['heuristicResult']> {
    console.log('🧪 Testing current heuristic approach...');
    
    try {
      const heuristicResult = await HeuristicAIDetector.findAIContent(page, query);
      
      if (!heuristicResult) {
        console.log('❌ Heuristic approach failed');
        return null;
      }

      const content = await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        return element ? element.textContent || '' : '';
      }, heuristicResult.selector);

      console.log(`✅ Heuristic found: ${heuristicResult.selector}, ${content.length} chars, ${heuristicResult.confidence}% confidence`);
      
      return {
        content,
        length: content.length,
        selector: heuristicResult.selector,
        confidence: heuristicResult.confidence
      };
    } catch (error) {
      console.log('❌ Heuristic approach error:', error);
      return null;
    }
  }

  private compareContent(mainColContent?: string, heuristicContent?: string): boolean {
    if (!mainColContent || !heuristicContent) return false;
    
    // Normalize content for comparison
    const normalize = (text: string) => text.toLowerCase().replace(/\s+/g, ' ').trim();
    const normalizedMain = normalize(mainColContent);
    const normalizedHeuristic = normalize(heuristicContent);
    
    // Check if they're the same or if one contains the other
    return normalizedMain === normalizedHeuristic ||
           normalizedMain.includes(normalizedHeuristic.substring(0, 200)) ||
           normalizedHeuristic.includes(normalizedMain.substring(0, 200));
  }

  private analyzeResults(mainCol: ComparisonResult['mainColFirstChild'], heuristic: ComparisonResult['heuristicResult']): string {
    if (!mainCol && !heuristic) {
      return '❌ Both approaches failed';
    }
    
    if (!mainCol) {
      return '❌ main-col failed, heuristic worked - main-col not reliable';
    }
    
    if (!heuristic) {
      return '⚠️ Heuristic failed, main-col worked - need to verify main-col quality';
    }
    
    const lengthDiff = Math.abs(mainCol.length - heuristic.length);
    const lengthRatio = lengthDiff / Math.max(mainCol.length, heuristic.length);
    
    if (lengthRatio < 0.1) {
      return '✅ Both approaches found similar content - main-col is likely reliable';
    } else if (mainCol.length > heuristic.length * 1.5) {
      return '⚠️ main-col found much more content - may include extra elements';
    } else if (heuristic.length > mainCol.length * 1.5) {
      return '⚠️ Heuristic found much more content - main-col may be incomplete';
    } else {
      return '🔍 Content lengths differ moderately - need manual inspection';
    }
  }

  async runComparisonSuite(): Promise<ComparisonResult[]> {
    // Use the same 15 queries from the existing test suite
    const testQueries = [
      'climate change effects',
      'artificial intelligence future',
      'renewable energy benefits',
      'space exploration missions',
      'healthy diet tips',
      'machine learning basics',
      'sustainable agriculture',
      'ocean pollution causes',
      'quantum computing explained',
      'biodiversity conservation',
      'solar energy advantages',
      'digital privacy protection',
      'genetic engineering ethics',
      'urban planning solutions',
      'neuroscience breakthroughs'
    ];

    const results: ComparisonResult[] = [];

    for (let i = 0; i < testQueries.length; i++) {
      const query = testQueries[i];
      console.log(`\n📊 Testing ${i + 1}/${testQueries.length}: "${query}"`);
      
      try {
        const result = await this.debugQuery(query);
        results.push(result);
        
        // Brief pause between queries
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`❌ Error testing query "${query}":`, error);
        results.push({
          query,
          mainColExists: false,
          mainColFirstChild: null,
          heuristicResult: null,
          contentMatch: false,
          analysis: `Error: ${error}`
        });
      }
    }

    return results;
  }

  generateReport(results: ComparisonResult[]): string {
    const totalQueries = results.length;
    const mainColSuccesses = results.filter(r => r.mainColExists).length;
    const heuristicSuccesses = results.filter(r => r.heuristicResult !== null).length;
    const contentMatches = results.filter(r => r.contentMatch).length;
    
    let report = `
🧪 MAIN-COL VS HEURISTIC COMPARISON REPORT
==========================================

📊 SUMMARY:
-----------
Total Queries: ${totalQueries}
main-col Success Rate: ${mainColSuccesses}/${totalQueries} (${Math.round(mainColSuccesses/totalQueries*100)}%)
Heuristic Success Rate: ${heuristicSuccesses}/${totalQueries} (${Math.round(heuristicSuccesses/totalQueries*100)}%)
Content Match Rate: ${contentMatches}/${totalQueries} (${Math.round(contentMatches/totalQueries*100)}%)

📋 DETAILED RESULTS:
--------------------
`;

    results.forEach((result, index) => {
      report += `\n${index + 1}. "${result.query}"
   main-col: ${result.mainColExists ? '✅' : '❌'} ${result.mainColFirstChild ? `(${result.mainColFirstChild.length} chars)` : ''}
   Heuristic: ${result.heuristicResult ? '✅' : '❌'} ${result.heuristicResult ? `(${result.heuristicResult.length} chars, ${result.heuristicResult.confidence}% conf)` : ''}
   Match: ${result.contentMatch ? '✅' : '❌'}
   Analysis: ${result.analysis}
`;
    });

    report += `\n\n🎯 RECOMMENDATION:
-------------------`;

    if (mainColSuccesses === totalQueries && contentMatches >= totalQueries * 0.8) {
      report += `
✅ PROCEED WITH MAIN-COL APPROACH!
- main-col is 100% reliable across all queries
- Content matches heuristic results in ${Math.round(contentMatches/totalQueries*100)}% of cases
- Safe to replace complex heuristic logic with simple main-col selector`;
    } else if (mainColSuccesses >= totalQueries * 0.9 && contentMatches >= totalQueries * 0.7) {
      report += `
⚠️ MAIN-COL MOSTLY RELIABLE - PROCEED WITH CAUTION
- main-col works in ${Math.round(mainColSuccesses/totalQueries*100)}% of cases
- Consider adding fallback logic for edge cases
- May still be worth simplifying from complex heuristics`;
    } else {
      report += `
❌ MAIN-COL NOT RELIABLE ENOUGH
- main-col only works in ${Math.round(mainColSuccesses/totalQueries*100)}% of cases
- Content matches only ${Math.round(contentMatches/totalQueries*100)}% of time
- Keep existing heuristic approach or investigate alternative selectors`;
    }

    return report;
  }

  async close(): Promise<void> {
    if (this.context) {
      await this.context.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Main execution
async function runMainColDebugSuite(): Promise<void> {
  console.log('🚀 Starting main-col vs heuristic comparison suite...\n');
  
  const debugTool = new MainColDebugger();
  
  try {
    await debugTool.initBrowser();
    const results = await debugTool.runComparisonSuite();
    const report = debugTool.generateReport(results);
    
    console.log(report);
    
    // Save detailed results to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `.kilo/main-col-debug-results-${timestamp}.json`;
    
    await import('fs/promises').then(fs => 
      fs.writeFile(filename, JSON.stringify(results, null, 2))
    );
    
    console.log(`\n💾 Detailed results saved to: ${filename}`);
    
  } finally {
    await debugTool.close();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMainColDebugSuite().catch(console.error);
}

export { MainColDebugger, type ComparisonResult };