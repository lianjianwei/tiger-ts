import { IApi, Type } from '../../contract';

export type HttpMethod = 'GET' | 'POST' | 'DELETE' | 'PUT' | 'ALL' | 'HEAD' | 'OPTIONS';

export const API_METEDATA: {
    [route: string]: {
        api: Type<IApi>;
        method: HttpMethod;
        validateType?: Type<any>;
    };
} = {};

export type ApiOption = {
    route: string;
    method?: HttpMethod;
    validateType?: Type<any>;
};

export function Api(opt: ApiOption): ClassDecorator {
    return (target: any) => {
        API_METEDATA[opt.route] = {
            api: target,
            method: opt.method || 'POST',
            validateType: opt.validateType
        };
    };
}
