import Router from 'koa-router';

import { Type } from './type';

export interface IApi {
    call(ctx: Router.RouterContext): Promise<any>;
}

export abstract class ApiFactoryBase {
    public abstract build(route: string): { api: IApi; validateType: Type<any>; };
}
