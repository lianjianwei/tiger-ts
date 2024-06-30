import ioc from '../ioc';
import { ConfigLoaderBase, DbFactoryBase, Type } from '../../contract';

export class Config {
    public static ctor = 'Config';

    public id: string;
    public item: any;
}

/**
 * mongo 配置加载器
 */
export class MongoConfigLoader extends ConfigLoaderBase {

    public constructor(
        private m_DbFactory: DbFactoryBase
    ) {
        super();
    }

    public async load<T>(typer: Type<T>) {
        const name = ioc.getKey(typer);
        const res = await this.m_DbFactory.build({
            model: Config
        }).query().findOne({
            where: {
                id: name
            }
        });
        return res?.item;
    }
}
