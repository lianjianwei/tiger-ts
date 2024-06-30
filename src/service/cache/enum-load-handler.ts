import ioc from '../ioc';
import { CacheBase, EnumItem, IEnumLoadHandler, Type } from '../../contract';

export class CacheEnumLoadHandler implements IEnumLoadHandler {

    public constructor(
        private m_Cache: CacheBase,
        private m_EnumLoadHandlers: IEnumLoadHandler[]
    ) { }

    public async load<T extends EnumItem>(typer: Type<T>) {
        const key = `Enum:${ioc.getKey(typer)}`;
        const res = await this.m_Cache.get(key, async () => {
            for (const r of this.m_EnumLoadHandlers) {
                const res = await r.load(typer);
                if (res.allItem)
                    return res.allItem;
            }
            return null;
        });
        return {
            cacheOn: await this.m_Cache.getCacheOn(key),
            allItem: res
        };
    }
}
