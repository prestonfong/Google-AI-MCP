/**
 * Dynamic AI Container Detection Utility
 * Replaces hardcoded selectors with content-based detection
 */
export declare class DynamicAISelector {
    /**
     * Find AI container selectors dynamically based on content and query
     */
    static findAIContainer(page: any, query: string): Promise<string | null>;
    /**
     * Find AI container with fallback to hardcoded selectors
     * Prioritizes proven hardcoded selectors, uses dynamic detection only as true fallback
     */
    static findAIContainerWithFallback(page: any, query: string): Promise<string | null>;
}
