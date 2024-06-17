import Koa from 'koa';
import Router from 'koa-router';

import { KoaOption } from './option';
import { CustomError } from '../error';
import { ApiFactoryBase } from '../../contract';
import { enum_ } from '../../model';

export function koaPostOption(apiFactory: ApiFactoryBase): KoaOption {
    return (app: Koa) => {
        const router = new Router();

        router.post('/:endpoint/:api', async (ctx) => {
            try {
                const api = apiFactory.build(ctx.request.path);
                api.body = ctx.request.body;
                api.header = ctx.request.header;
                ctx.body = {
                    err: enum_.ErrorCode.success,
                    data: await api.call()
                };
            } catch (err) {
                if (err instanceof CustomError) {
                    ctx.body = {
                        err: err.code,
                        data: err.data
                    };
                } else {
                    ctx.body = {
                        err: enum_.ErrorCode.serverInternal,
                        data: (err instanceof Error) ? err.stack : null
                    };
                }
            }
        });

        app.use(router.routes());
        app.use(router.allowedMethods());
    };
}
