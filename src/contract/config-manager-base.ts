import { Type } from './type';

/**
 * 配置管理器
 * 
 * 使用方式:
 * ```typescript
 * class TestConfig {
 *     public static ctor = 'TestConfig';
 * 
 *     public name: string;
 *     public url: string;
 * }
 * 
 * const configLoader: ConfigLoaderBase;
 * const cfg = await configLoader.load(TestConfig);
 * console.log(cfg);
 * ```
 */
export abstract class ConfigManagerBase {
    /**
     * 获取指定类型配置
     * 
     * @param typer 类型
     */
    public abstract get<T>(typer: Type<T> | string): T;

    /**
     * 更新指定类型的配置值
     * 
     * @param typer 类型
     * @param data 配置值
     */
    public abstract update<T>(typer: Type<T>, data: T): void;
}
