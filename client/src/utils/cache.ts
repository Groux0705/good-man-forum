// 简单的内存缓存实现
class MemoryCache {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    // 默认TTL为5分钟
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // 清理过期缓存
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const memoryCache = new MemoryCache();

// 定期清理过期缓存
setInterval(() => {
  memoryCache.cleanup();
}, 10 * 60 * 1000); // 每10分钟清理一次

// 带缓存的fetch函数
export async function cachedFetch(url: string, options: RequestInit = {}, cacheKey?: string, ttl?: number): Promise<Response> {
  const key = cacheKey || `${options.method || 'GET'}:${url}`;
  
  // 只缓存GET请求
  if (!options.method || options.method.toLowerCase() === 'get') {
    const cached = memoryCache.get(key);
    if (cached) {
      return new Response(JSON.stringify(cached), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  const response = await fetch(url, options);
  
  // 只缓存成功的GET请求
  if (response.ok && (!options.method || options.method.toLowerCase() === 'get')) {
    const data = await response.clone().json();
    memoryCache.set(key, data, ttl);
  }

  return response;
}

// 清除特定模式的缓存
export function invalidateCache(pattern: string): void {
  const keys = Array.from(memoryCache['cache'].keys());
  keys.forEach(key => {
    if (key.includes(pattern)) {
      memoryCache.delete(key);
    }
  });
}