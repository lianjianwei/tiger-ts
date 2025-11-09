import { CacheBase } from '../../contract';

export class MemoryCache extends CacheBase {
    private m_Cache = new Map<string, Promise<any>>();

    public get<T>(key: string, fn: () => Promise<T>) {
        if (this.m_Cache.has(key)) {
            return this.m_Cache.get(key);
        }

        const res = fn();
        this.m_Cache.set(key, res);
        return res;
    }

    public flush(key: string) {
        this.m_Cache.delete(key);
    }
}
