import ioc from '../ioc';
import { CacheBase, ConfigLoaderBase, Type } from '../../contract';

/**
 * 缓存配置加载器
 * 
 * 可以缓存配置加载结果，具体缓存机制看 m_Cache 实现类
 */
export class CacheConfigLoader extends ConfigLoaderBase {

    public constructor(
        private m_Cache: CacheBase,
        private m_ConfigLoaders: ConfigLoaderBase[]
    ) {
        super();
    }

    public load<T>(typer: Type<T>) {
        const key = `Config:${ioc.getKey(typer)}`;
        return this.m_Cache.get(key, async () => {
            for (const r of this.m_ConfigLoaders) {
                const res = await r.load(typer);
                if (res)
                    return res;
            }
            return null;
        });
    }
}
