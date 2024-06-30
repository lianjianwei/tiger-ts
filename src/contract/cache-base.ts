export abstract class CacheBase {
    /**
     * 根据key获取缓存数据
     * @param key
     */
    public abstract get<T>(key: string, fn: () => Promise<T>): Promise<T>;

    /**
     * 根据key获取缓存时间
     * @param key 
     */
    public abstract getCacheOn(key: string): Promise<number>;

    /**
     * 清除key对应的缓存数据
     * @param key
     */
    public abstract flush(key: string): Promise<void>;
}
