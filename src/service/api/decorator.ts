import { IApi, Type } from '../../contract';

export const metedata: {
    [route: string]: {
        api: Type<IApi>;
        validateType?: Type<any>;
    };
} = {};

export type ApiOption = {
    route: string;
    validateType?: Type<any>;
};

export function Api(opt: ApiOption): ClassDecorator {
    return (target: any) => {
        metedata[opt.route] = {
            api: target,
            validateType: opt.validateType
        };
    };
}
