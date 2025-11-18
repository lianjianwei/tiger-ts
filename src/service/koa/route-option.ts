import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import Koa from 'koa';
import Router from '@koa/router';

import { KoaOption } from './option';
import { CustomError } from '../error';
import { API_METEDATA } from '../../decorator';
import { ApiFactoryBase } from '../../contract';
import { enum_ } from '../../model';

export function koaRouteOption(apiFactory: ApiFactoryBase): KoaOption {
    return (app: Koa) => {
        const router = new Router();

        for (const [route, data] of Object.entries(API_METEDATA)) {
            router[data.options.method.toLowerCase()](route, async (ctx: Router.RouterContext) => {
                const { api, options } = apiFactory.build(ctx.request.path);
                if (options.validateType) {
                    const body = plainToInstance(options.validateType, ctx.request.body);
                    const res = await validate(body, {
                        forbidUnknownValues: false
                    });
                    if (res.length)
                        throw new CustomError(enum_.ErrorCode.invalidParams, res);
                }
                const res = await api.call(ctx);
                if (options.origin) {
                    ctx.body = res;
                } else {
                    ctx.body = {
                        err: enum_.ErrorCode.success,
                        data: res
                    };
                }
            });
        }

        app.use(router.routes());
        app.use(router.allowedMethods());
    };
}
