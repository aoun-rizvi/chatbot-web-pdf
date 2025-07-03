// lib/cache.ts
const chunkCache = new Map<string, any>();

export function getCachedChunks(key: string) {
  return chunkCache.get(key);
}

export function setCachedChunks(key: string, data: any) {
  chunkCache.set(key, {
    data,
    timestamp: Date.now(),
  });
}
