# Google AI Overview Extractor

A Node.js tool that demonstrates how to extract Google's AI Overview content from search results using Playwright for headless browser automation.

## ⚠️ Important Notice

**Google actively blocks automated requests** and this tool is primarily for **educational and demonstration purposes**. For production use, consider:

- Google Custom Search API
- SerpApi or similar services
- Rate limiting and proxy rotation
- Manual browsing for research

## Features

- 🤖 **AI Overview Extraction**: Attempts to extract Google's AI Overview text
- 🛡️ **Stealth Techniques**: Multiple anti-detection strategies
- 🔄 **Retry Logic**: Automatic retry with exponential backoff
- 📊 **Source Links**: Extracts related source citations when available
- 🧪 **Comprehensive Testing**: Full test suite with error handling validation
- 📝 **TypeScript**: Fully typed for better development experience

## Installation

```bash
npm install
npx playwright install chromium
npm run build
```

## Usage

### Command Line Interface

```bash
# Basic AI Overview extraction (likely to be blocked)
npm run dev "what is artificial intelligence"

# Practical mode (extracts search results when AI Overview is blocked)
npm run dev "climate change effects" --practical

# More examples
npm run dev "benefits of meditation"
npm run dev "machine learning definition" --practical
```

### Programmatic Usage

```typescript
import { getGoogleAIOverview, getGoogleSearchContent } from './dist/index.js';

// Try AI Overview extraction
const result = await getGoogleAIOverview('your query', {
  timeout: 30000,
  retries: 3,
  headless: true
});

// Or use practical mode for search results
const content = await getGoogleSearchContent('your query');

console.log(result.aiOverview?.text);
```

## Architecture

### Core Components

- **`GoogleAIExtractor`**: Main class for AI Overview extraction
- **`PracticalGoogleExtractor`**: Fallback for search results extraction
- **`DebugGoogleExtractor`**: Enhanced version with debugging capabilities
- **Type Definitions**: Comprehensive TypeScript interfaces

### Key Features

1. **Multiple Selector Strategies**: Uses various CSS selectors to find AI Overview content
2. **Content-Based Detection**: Fallback pattern matching for AI-generated text
3. **Stealth Configuration**: Browser arguments and headers to avoid detection
4. **Error Handling**: Graceful degradation with meaningful error messages

## Testing

```bash
# Run the full test suite
npm run test

# Or run individual tests
node .kilo/test-integration.js
node .kilo/test-practical.js
node .kilo/test-debug.js
```

## Expected Behavior

### ✅ What Works
- Tool architecture and error handling
- TypeScript compilation and type safety
- Graceful failure when Google blocks requests
- Proper browser automation setup
- Source link extraction (when available)

### ⚠️ Expected Limitations
- Google's aggressive bot detection
- CAPTCHA challenges for automated requests
- Rate limiting and IP blocking
- Inconsistent AI Overview availability

## Technical Details

### Browser Configuration
- Chromium with stealth arguments
- Custom user agents and headers
- Disabled automation flags
- Random delays to mimic human behavior

### Error Handling
- Specific error messages for different failure types
- Retry logic with configurable attempts
- Timeout handling for long-running operations
- Graceful degradation to alternative extraction methods

## Development

```bash
# Development mode with auto-reload
npm run dev

# Build TypeScript
npm run build

# Run specific test
node dist/test.js
```

## Legal and Ethical Considerations

This tool is intended for:
- ✅ Educational purposes
- ✅ Understanding web scraping techniques
- ✅ Demonstrating browser automation
- ✅ Learning about anti-detection methods

**Not intended for:**
- ❌ Large-scale automated data collection
- ❌ Circumventing Google's terms of service
- ❌ Commercial scraping operations
- ❌ Overwhelming Google's servers

## Production Alternatives

For production use cases, consider these alternatives:

1. **Google Custom Search API**
   - Official Google API
   - Structured data format
   - Rate limiting and quotas
   - Commercial licensing available

2. **SerpApi**
   - Third-party service
   - Handles anti-bot detection
   - Multiple search engines
   - JSON API responses

3. **Manual Research**
   - Browser-based research
   - Copy-paste workflows
   - Human verification
   - Compliance with terms of service

## License

MIT License - See LICENSE file for details.

## Contributing

This is a demonstration project. For improvements:
1. Focus on educational value
2. Maintain ethical usage patterns
3. Improve error handling and user experience
4. Add more comprehensive documentation

---

**Disclaimer**: This tool is for educational purposes only. Users are responsible for complying with Google's Terms of Service and applicable laws. The authors are not responsible for misuse of this tool.