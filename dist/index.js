#!/usr/bin/env node
import { getGoogleAISearchResponse, getGoogleAISearchResponses, GoogleAISearchExtractor } from './google-ai-search.js';
async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log('Usage: npm run dev "your question"');
        console.log('       node dist/index.js "your question"');
        process.exit(1);
    }
    const query = args.join(' ');
    const options = {
        timeout: 60000,
        retries: 1,
        headless: false
    };
    try {
        const result = await getGoogleAISearchResponse(query, options);
        if (result.success && result.aiResponse) {
            console.log(result.aiResponse.text);
            if (result.aiResponse.sources && result.aiResponse.sources.length > 0) {
                console.log('\nSources:');
                result.aiResponse.sources.forEach((source, index) => {
                    console.log(`${index + 1}. ${source.title}`);
                    console.log(`   ${source.url} (${source.domain})`);
                });
            }
        }
        else {
            console.error(`Error: ${result.error}`);
            process.exit(1);
        }
    }
    catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}
export { getGoogleAISearchResponse, getGoogleAISearchResponses, GoogleAISearchExtractor };
export * from './types.js';
if (process.argv[1] && (process.argv[1].endsWith('index.js') || process.argv[1].endsWith('index.ts'))) {
    main().catch(console.error);
}
