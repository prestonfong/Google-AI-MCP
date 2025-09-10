/**
 * Dynamic AI Container Detection Utility
 * Replaces hardcoded selectors with content-based detection
 */
export class DynamicAISelector {
  /**
   * Find AI container selectors dynamically based on content and query
   */
  static async findAIContainer(page: any, query: string): Promise<string | null> {
    try {
      const dynamicResults = await page.evaluate((searchQuery: string) => {
        const results: Array<{
          selector: string;
          element: Element;
          contentLength: number;
          confidence: number;
          reasons: string[];
        }> = [];

        // Find all divs with substantial content
        const allDivs = document.querySelectorAll('div');
        
        for (let i = 0; i < allDivs.length; i++) {
          const div = allDivs[i];
          const content = div.textContent || '';
          
          // Skip elements with insufficient content
          if (content.length < 500) continue;
          
          let confidence = 0;
          const reasons: string[] = [];
          const lowerContent = content.toLowerCase();
          const lowerQuery = searchQuery.toLowerCase();
          
          // Primary indicators - search query relevance
          if (lowerContent.includes(lowerQuery) && content.length > 1000) {
            confidence += 40;
            reasons.push('Contains search query with substantial content');
          }
          
          // Extract topic keywords from query for better matching
          const queryWords = lowerQuery.split(' ').filter(word => word.length > 2);
          let topicMatches = 0;
          queryWords.forEach(word => {
            if (lowerContent.includes(word)) {
              topicMatches++;
            }
          });
          
          if (topicMatches >= 2) {
            confidence += 30;
            reasons.push('Contains multiple topic keywords');
          }
          
          // AI response patterns
          if (lowerContent.includes('according to') || 
              lowerContent.includes('based on') || 
              lowerContent.includes('research shows') ||
              lowerContent.includes('studies indicate')) {
            confidence += 20;
            reasons.push('Contains AI attribution patterns');
          }
          
          // Content structure indicators
          if (content.length > 2000 && content.split('.').length > 10) {
            confidence += 25;
            reasons.push('Has comprehensive content structure');
          }
          
          // Google-specific AI indicators
          if (lowerContent.includes('thinking') || 
              lowerContent.includes('looking at') || 
              lowerContent.includes('putting it all together')) {
            confidence += 15;
            reasons.push('Contains Google AI generation indicators');
          }
          
          // Penalty for navigation/UI elements
          if ((lowerContent.includes('search') && lowerContent.includes('images') && lowerContent.includes('videos')) ||
              lowerContent.includes('cookie') || 
              lowerContent.includes('privacy policy') ||
              lowerContent.includes('sign in')) {
            confidence -= 40;
            reasons.push('Likely UI element (PENALTY)');
          }
          
          // Only consider high-confidence candidates
          if (confidence > 50) {
            // Generate robust selector
            let selector = 'div';
            
            // Prefer ID if available
            if (div.id) {
              selector += `#${div.id}`;
              confidence += 5;
            } else {
              // Use class if available
              if (div.className) {
                const classes = div.className.trim().split(/\s+/);
                // Use first class that's meaningful (not auto-generated)
                const meaningfulClass = classes.find(cls => 
                  cls.length > 2 && 
                  !cls.match(/^[a-zA-Z]\d+$/) && // Avoid 'a1', 'b2' style
                  !cls.includes('_') // Avoid mangled classes
                );
                if (meaningfulClass) {
                  selector += `.${meaningfulClass}`;
                }
              }
              
              // Add jsname if available (Google-specific)
              const jsname = div.getAttribute('jsname');
              if (jsname) {
                selector += `[jsname="${jsname}"]`;
                confidence += 15;
                reasons.push(`Has jsname: ${jsname}`);
              }
              
              // Add data-ved if available (Google-specific)
              const dataVed = div.getAttribute('data-ved');
              if (dataVed && !selector.includes('[jsname=')) {
                selector += `[data-ved="${dataVed}"]`;
                confidence += 10;
                reasons.push('Has data-ved attribute');
              }
            }
            
            results.push({
              selector,
              element: div,
              contentLength: content.length,
              confidence,
              reasons
            });
          }
        }
        
        // Sort by confidence and return top candidates
        const sorted = results.sort((a, b) => b.confidence - a.confidence);
        
        // Return serializable results (without DOM elements)
        return sorted.map(r => ({
          selector: r.selector,
          contentLength: r.contentLength,
          confidence: r.confidence,
          reasons: r.reasons
        }));
        
      }, query);
      
      if (dynamicResults.length === 0) {
        console.log('⚠️ Dynamic detection found no suitable AI containers');
        return null;
      }
      
      // Log the detection results for debugging
      console.log(`🎯 Dynamic AI detection found ${dynamicResults.length} candidates:`);
      const topCandidate = dynamicResults[0];
      console.log(`   Top: ${topCandidate.selector} (${topCandidate.confidence}% confidence)`);
      console.log(`   Reasons: ${topCandidate.reasons.join(', ')}`);
      
      return topCandidate.selector;
      
    } catch (error) {
      console.error('❌ Dynamic selector detection failed:', error);
      return null;
    }
  }
  
  /**
   * Find AI container with fallback to hardcoded selectors
   */
  static async findAIContainerWithFallback(page: any, query: string): Promise<string | null> {
    // Try dynamic detection first
    const dynamicSelector = await this.findAIContainer(page, query);
    if (dynamicSelector) {
      // Verify the selector actually finds content
      try {
        const element = await page.$(dynamicSelector);
        if (element) {
          const content = await element.textContent();
          if (content && content.length > 500) {
            console.log('✅ Using dynamic selector:', dynamicSelector);
            return dynamicSelector;
          }
        }
      } catch (error) {
        console.log('⚠️ Dynamic selector validation failed:', error);
      }
    }
    
    // Fallback to hardcoded selectors
    console.log('🔄 Falling back to hardcoded selectors');
    const hardcodedSelectors = [
      'div[jsname="htVhGf"]',
      'div[jsname="RH7zg"]', 
      '.qJYHHd.maIobf',
      '.tonYlb'
    ];
    
    for (const selector of hardcodedSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const content = await element.textContent();
          if (content && content.length > 500) {
            console.log('✅ Using fallback selector:', selector);
            return selector;
          }
        }
      } catch (error) {
        // Continue to next selector
      }
    }
    
    console.log('❌ No suitable AI container found (dynamic or hardcoded)');
    return null;
  }
}