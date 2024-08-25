import { MemoryCacheKey, MemoryCacheBase } from '../../contract';

export class MemoryCache extends MemoryCacheBase {

    private m_Content: Map<MemoryCacheKey, any> = new Map();

    public get<T>(key: MemoryCacheKey) {
        return this.m_Content.get(key) as T;
    }

    public set(key: MemoryCacheKey, value: any) {
        this.m_Content.set(key, value);
    }

    public del(key: MemoryCacheKey) {
        this.m_Content.delete(key);
    }
}
