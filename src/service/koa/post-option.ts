import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import Koa from 'koa';
import Router from 'koa-router';

import { KoaOption } from './option';
import { CustomError } from '../error';
import { ApiFactoryBase, LogFactoryBase } from '../../contract';
import { enum_ } from '../../model';

export function koaPostOption(apiFactory: ApiFactoryBase, logFactory?: LogFactoryBase): KoaOption {
    return (app: Koa) => {
        const router = new Router();

        router.post('/:endpoint/:api', async (ctx) => {
            const log = logFactory?.build();
            log?.addField('protocol', 'http')
                .addField('route', ctx.request.path)
                .addField('header', ctx.request.header)
                .addField('request', ctx.request.body);
            const beginOn = Date.now();
            try {
                const { api, validateType } = apiFactory.build(ctx.request.path);
                if (validateType) {
                    api.body = plainToInstance(validateType, ctx.request.body);
                    const res = await validate(api.body);
                    if (res.length)
                        throw new CustomError(enum_.ErrorCode.invalidParams, res);
                } else {
                    api.body = ctx.request.body;
                }
                api.header = ctx.request.header;
                const res = await api.call();
                ctx.body = {
                    err: enum_.ErrorCode.success,
                    data: res
                };
                log?.addField('time-diff', (Date.now() - beginOn))
                    .addField('response', ctx.body).debug();
            } catch (err: Error | any) {
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
                log?.addField('time-diff', (Date.now() - beginOn))
                    .addField('response', ctx.body).error(err);
            }
        });

        app.use(router.routes());
        app.use(router.allowedMethods());
    };
}
