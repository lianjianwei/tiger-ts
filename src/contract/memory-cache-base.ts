import { Type } from './type';

export type MemoryCacheKey = string | number | Symbol | Type<any>;

/**
 * 内存缓存
 */
export abstract class MemoryCacheBase {
    /**
     * 获取缓存
     * @param key 缓存键
     */
    public abstract get<T>(key: MemoryCacheKey): T;

    /**
     * 设置缓存
     * @param key 缓存键
     * @param value 缓存内容
     */
    public abstract set(key: MemoryCacheKey, value: any): void;

    /**
     * 删除缓存
     * @param key 缓存键
     */
    public abstract del(key: MemoryCacheKey): void;
}
