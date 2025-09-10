import { GoogleAISearchResult, SearchOptions } from './types.js';
export declare class GoogleAISearchExtractor {
    private browser;
    private context;
    constructor();
    private initBrowser;
    searchAIContent(query: string, options?: SearchOptions): Promise<GoogleAISearchResult>;
    private waitForPageStability;
    close(): Promise<void>;
}
export declare function getGoogleAISearchResponses(queries: string[], options?: SearchOptions): Promise<GoogleAISearchResult[]>;
export declare function getGoogleAISearchResponse(query: string, options?: SearchOptions): Promise<GoogleAISearchResult>;
