export abstract class CacheBase {
    public abstract get<T>(key: string, fn: () => Promise<T>): Promise<T>;

    public abstract flush(key: string): void;
}
