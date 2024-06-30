import { CacheBase } from '../../contract';

export class MemoryCache extends CacheBase {
    private m_Cache: {
        [key: string]: {
            cacheOn: number;
            data: any;
        };
    } = {};

    public async get<T>(key: string, fn: () => Promise<T> | T) {
        this.m_Cache[key] ??= {
            cacheOn: Date.now(),
            data: fn()
        };
        return this.m_Cache[key].data as T;
    }

    public async getCacheOn(key: string) {
        return this.m_Cache[key]?.cacheOn ?? 0;
    }

    public async flush(key: string) {
        delete this.m_Cache[key];
    }
}
