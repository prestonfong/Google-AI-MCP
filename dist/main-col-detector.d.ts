/**
 * Ultra-Simple Main-Col AI Content Detection
 * Replaces 200+ lines of complex heuristics with simple, reliable selector
 */
export declare class MainColDetector {
    /**
     * Find AI content using the stable main-col selector
     * This is the ultra-simplified replacement for HeuristicAIDetector
     */
    static findAIContent(page: any, query: string): Promise<{
        element: any;
        selector: string;
        confidence: number;
    } | null>;
}
