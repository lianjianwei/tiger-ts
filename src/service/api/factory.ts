import { Container } from 'typedi';

import { metedata } from './decorator';
import { ApiFactoryBase, IApi } from '../../contract';

export class ApiFactory extends ApiFactoryBase {
    public build(route: string) {
        const instance = Container.get<IApi>(metedata[route] as any);
        Container.remove(metedata[route] as any);
        return instance;
    }
}
