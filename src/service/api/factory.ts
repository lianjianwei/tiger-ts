import { Container } from 'typedi';

import { API_METEDATA } from './decorator';
import { CustomError } from '../error';
import { ApiFactoryBase, IApi } from '../../contract';
import { enum_ } from '../../model';

export class ApiFactory extends ApiFactoryBase {
    public build(route: string) {
        if (!API_METEDATA[route])
            throw new CustomError(enum_.ErrorCode.apiNotExists);

        return {
            api: Container.get<IApi>(API_METEDATA[route].api),
            validateType: API_METEDATA[route].validateType
        };
    }
}
