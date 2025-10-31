// api/ua.js
import { Redis } from '@upstash/redis';

export const config = {
  runtime: 'edge', // ensures speed and global access
};

const INDEX_KEY = 'ua:currentIndex';

// Initialize Redis client (uses Vercel's environment variables)
const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Load JSON data dynamically (Edge Runtime compatible)
let uaDataCache = null;
async function loadUaData() {
  if (uaDataCache) return uaDataCache;
  
  // For Edge Functions, use dynamic import without assert
  const dataModule = await import('../data/ua.json');
  uaDataCache = dataModule.default || dataModule;
  return uaDataCache;
}

export default async function handler(request) {
  try {
    // Load user agent data
    const uaData = await loadUaData();
    const total = uaData.useragents.length;
    
    // ============================================================================
    // INDEX CONTROL - Deployment Options
    // ============================================================================
    // 
    // To control index behavior during deployment, set ONE of these environment
    // variables in Vercel Dashboard → Settings → Environment Variables:
    //
    // Option 1: CONTINUE FROM LAST INDEX (Default behavior)
    //   → Don't set any variable, or set: RESET_INDEX=false
    //   → This continues from where you left off
    //
    // Option 2: RESTART FROM INDEX 1
    //   → Set: RESET_INDEX=true  (or RESTART_INDEX=true)
    //   → This resets the index to 1 on next request
    //
    // Option 3: START FROM CUSTOM INDEX
    //   → Set: START_INDEX=250  (or any number between 1 and total)
    //   → This starts from the specified index on next request
    //
    // Note: These can also be controlled via query parameters for testing:
    //   ?reset=1  → Reset to index 1
    //   ?start=100 → Start from index 100
    // ============================================================================
    
    // Parse query parameters (for testing/debugging)
    const url = new URL(request.url);
    const queryReset = url.searchParams.get('reset');
    const queryStart = url.searchParams.get('start');
    
    // Check environment variables (for deployment control)
    const resetIndex = process.env.RESET_INDEX === 'true' || 
                       process.env.RESTART_INDEX === 'true' || 
                       queryReset === '1';
    const startIndex = process.env.START_INDEX ? 
                       parseInt(process.env.START_INDEX) : 
                       (queryStart ? parseInt(queryStart) : null);
    
    // Get current index from Redis (returns null if not exists)
    let currentIndex = await redis.get(INDEX_KEY);
    
    // Handle index reset/restart logic
    if (resetIndex) {
      // RESET: Start from index 1
      currentIndex = 0; // Will become 1 after increment
      await redis.set(INDEX_KEY, 0);
    } else if (startIndex !== null && !isNaN(startIndex)) {
      // CUSTOM START: Start from specified index
      // Validate: ensure it's between 1 and total
      const validIndex = Math.max(1, Math.min(total, parseInt(startIndex)));
      currentIndex = validIndex - 1; // Will become validIndex after increment
      await redis.set(INDEX_KEY, validIndex - 1);
    } else if (currentIndex === null || currentIndex === undefined) {
      // CONTINUE: Default - continue from last index, or start at 0 if first time
      currentIndex = 0;
    } else {
      // CONTINUE: Parse existing index
      currentIndex = parseInt(currentIndex);
    }
    
    // Increment and wrap around if needed (1-indexed for response)
    currentIndex = (currentIndex % total) + 1;
    
    // Save the new index to Redis (persistent across all edge locations)
    await redis.set(INDEX_KEY, currentIndex);
    
    const ua = uaData.useragents[currentIndex - 1]; // Convert to 0-indexed for array access

    const response = {
      authorisedUserAgent: ua,
      indexReturned: currentIndex,
      total: total,
      updated: uaData.updated,
      browserChoice: uaData.browser_choice,
      // Include info about index control (for debugging)
      ...(resetIndex && { _note: 'Index was reset to 1' }),
      ...(startIndex !== null && !isNaN(startIndex) && { _note: `Index was set to ${startIndex}` }),
    };

    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    // Fallback if Redis is not configured - return error with instructions
    console.error('Redis Error:', e.message);
    
    return new Response(
      JSON.stringify({
        error: true,
        message: 'Upstash Redis not configured. Please ensure KV_REST_API_URL and KV_REST_API_TOKEN environment variables are set.',
        details: e.message,
        instructions: 'Ensure your Upstash Redis database is connected to your Vercel project. Environment variables should be automatically configured.',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
