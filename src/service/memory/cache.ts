import { CacheBase } from '../../contract';

export class MemoryCache extends CacheBase {
    private m_Cache: {
        [key: string]: any;
    } = {};

    public async get<T>(key: string, fn: () => Promise<T> | T) {
        this.m_Cache[key] ??= fn();
        return this.m_Cache[key] as T;
    }

    public async flush(key: string) {
        delete this.m_Cache[key];
    }
}
