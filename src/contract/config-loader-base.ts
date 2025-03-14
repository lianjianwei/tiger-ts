import { Type } from './type';

/**
 * 配置加载器
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
export abstract class ConfigLoaderBase {
    /**
     * @param typer 类型
     */
    public abstract load<T>(typer: Type<T> | string): Promise<T>;

    /**
     * 刷新配置
     * 
     * @param typer 类型
     */
    public abstract flush<T>(typer?: Type<T> | string): Promise<void>;
}
