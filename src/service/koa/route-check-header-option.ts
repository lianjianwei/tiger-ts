import Koa from 'koa';

import { CustomError } from '../error';
import { BaseState, RouterContext } from '../../contract';
import { enum_ } from '../../model';

export type RouteCheckHeaderOption = {
    value: string;
    headerKey: string;
    includePath: string;
    errMsg?: string;
};

export function koaRouteCheckHeaderOption(option: RouteCheckHeaderOption) {
    return (app: Koa) => {
        app.use(async (ctx: RouterContext<any, BaseState>, next) => {
            if (ctx.request.path.includes(option.includePath)) {
                const headerIhKey = ctx.request.header[option.headerKey];
                if (headerIhKey != option.value) {
                    throw new CustomError(enum_.ErrorCode.invalidParams, option.errMsg || 'access not allowed');
                }
            }

            await next();
        });
    };
}
