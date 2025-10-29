import { Container } from 'typedi';

import { CustomError } from '../error';
import { ApiFactoryBase, IApi } from '../../contract';
import { API_METEDATA } from '../../decorator';
import { enum_ } from '../../model';

export class ApiFactory extends ApiFactoryBase {
    public build(route: string) {
        if (!API_METEDATA[route])
            throw new CustomError(enum_.ErrorCode.apiNotExists);

        return {
            api: Container.get<IApi>(API_METEDATA[route].api),
            options: API_METEDATA[route].options
        };
    }
}
