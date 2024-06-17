import { Container } from 'typedi';

import { metedata } from './decorator';
import { CustomError } from '../error';
import { ApiFactoryBase, IApi } from '../../contract';
import { enum_ } from '../../model';

export class ApiFactory extends ApiFactoryBase {
    public build(route: string) {
        if (!metedata[route])
            throw new CustomError(enum_.ErrorCode.apiNotExists);

        const instance = Container.get<IApi>(metedata[route] as any);
        Container.remove(metedata[route] as any);
        return instance;
    }
}
