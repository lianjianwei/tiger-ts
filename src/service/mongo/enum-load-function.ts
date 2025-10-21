import { ioc } from '../ioc';
import { DbFactoryBase, EnumItem, Type } from '../../contract';
import { table } from '../../model';

export function mongoEnumLoadFunction<T extends EnumItem>(dbFactory: DbFactoryBase) {
    return async (typer: Type<T> | string, srvNo: number) => {
        const key = ioc.getKey(typer);
        const entry = await dbFactory.build({
            model: table.Enum,
            srvNo: srvNo
        }).findOne({
            where: {
                id: key
            }
        });
        return (entry?.items ?? []).reduce((memo, r) => {
            memo[r.value] = r as T;
            return memo;
        }, {} as { [value: number]: T; });
    }
}
