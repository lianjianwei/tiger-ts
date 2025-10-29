import Router from '@koa/router';
import { Files } from 'formidable';
import { Type } from './type';

export type RouterContext<T = any, S = any> = Router.RouterContext<S> & {
    request: Router.RouterContext['request'] & {
        body?: T;
        files?: Files;
    };
};

export type HttpMethod = 'GET' | 'POST' | 'DELETE' | 'PUT' | 'ALL' | 'HEAD' | 'OPTIONS';

export type ApiOption = Partial<{
    /**
     * 支持的方法
     */
    method: HttpMethod;
    /**
     * 校验请求体的参数
     */
    validateType: Type<any>;
    /**
     * 是否直接返回api返回的数据，不包装一层{ err: 0, data: any }
     */
    origin: boolean;
    /**
     * 其他自定义元数据
     */
    [key: string]: any;
}>;

export interface IApi<TBody = any, TSession = any> {
    call(ctx: RouterContext<TBody, TSession>): Promise<any>;
}

export abstract class ApiFactoryBase {
    public abstract build(route: string): { api: IApi; options: ApiOption };
}
