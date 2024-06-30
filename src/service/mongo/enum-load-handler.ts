import ioc from '../ioc';
import { DbFactoryBase, EnumItem, IEnumLoadHandler, Type } from '../../contract';

export class Enum {
    public static ctor = 'Enum';

    public id: string;
    public items: EnumItem[];
}

export class MongoEnumLoadHandler implements IEnumLoadHandler {

    public constructor(
        private m_DbFactory: DbFactoryBase
    ) { }

    public async load<T extends EnumItem>(typer: Type<T>): Promise<{ allItem: { [value: number]: T; }; cacheOn: number; }> {
        const name = ioc.getKey(typer);
        const res = await this.m_DbFactory.build({
            model: Enum
        }).query().findOne({
            where: {
                id: name
            }
        });
        return {
            cacheOn: 0,
            allItem: res?.items.reduce((memo, r) => {
                memo[r.value] = r as T;
                return memo;
            }, {} as { [value: number]: T; })
        };
    }
}
