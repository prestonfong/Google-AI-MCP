export interface GoogleAISearchResult {
  success: boolean;
  query: string;
  aiResponse?: {
    text: string;
    sources?: Array<{
      title: string;
      url: string;
      domain: string;
    }>;
  };
  error?: string;
  timestamp: string;
}

export interface SearchOptions {
  timeout?: number;
  retries?: number;
  headless?: boolean;
  userAgent?: string;
  delay?: number;
}

export interface BrowserConfig {
  headless: boolean;
  args: string[];
  userAgent: string;
  viewport: {
    width: number;
    height: number;
  };
}