import { IApi } from '../../contract';

export const metedata: {
    [route: string]: IApi;
} = {};

export function Api(route: string): ClassDecorator {
    return (target: any) => {
        metedata[route] = target;
    };
}
