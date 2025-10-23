import Router from 'koa-router';
import { Files } from 'formidable';

import { Type } from './type';

export type RouterContext<T = any, S = any> = Router.RouterContext<S> & {
    request: Router.RouterContext['request'] & {
        body?: T;
        files?: Files;
    };
};

export interface IApi<TBody = any, TSession = any> {
    call(ctx: RouterContext<TBody, TSession>): Promise<any>;
}

export abstract class ApiFactoryBase {
    public abstract build(route: string): { api: IApi; validateType: Type<any>; };
}
