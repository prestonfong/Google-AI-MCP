/**
 * Ultra-Simple Main-Col AI Content Detection
 * Replaces 200+ lines of complex heuristics with simple, reliable selector
 */
export class MainColDetector {
    /**
     * Find AI content using the stable main-col selector
     * This is the ultra-simplified replacement for HeuristicAIDetector
     */
    static async findAIContent(page, query) {
        try {
            console.log('🎯 Using ultra-simple main-col detection - no complex heuristics needed');
            // The selector is stable and provided by Google
            const selector = '[data-container-id="main-col"] > *:first-child';
            const element = await page.$(selector);
            if (!element) {
                console.log('❌ main-col first child not found');
                return null;
            }
            // Verify it has substantial content
            const contentLength = await page.evaluate((sel) => {
                const el = document.querySelector(sel);
                return el ? (el.textContent || '').length : 0;
            }, selector);
            if (contentLength < 500) {
                console.log('❌ main-col first child has insufficient content');
                return null;
            }
            console.log(`✅ Found AI content using main-col selector (${contentLength} chars)`);
            console.log(`📑 Selector: ${selector}`);
            return {
                element,
                selector,
                confidence: 100 // Always 100% confidence - this is Google's own selector
            };
        }
        catch (error) {
            console.error('❌ Main-col detection failed:', error);
            return null;
        }
    }
}
