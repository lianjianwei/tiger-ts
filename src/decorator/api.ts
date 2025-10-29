import { ApiOption, IApi, Type } from '../contract';

export const API_METEDATA: {
    [route: string]: {
        api: Type<IApi>;
        options: ApiOption;
    };
} = {};

export function Api(route: string, option: ApiOption = {}): ClassDecorator {
    return (target: any) => {
        option.method ??= 'POST';
        API_METEDATA[route] = {
            api: target,
            options: option
        };
    };
}
