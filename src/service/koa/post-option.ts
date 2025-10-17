import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import Koa from 'koa';
import Router from 'koa-router';

import { KoaOption } from './option';
import { API_METEDATA } from '../api';
import { CustomError } from '../error';
import { ApiFactoryBase, LogFactoryBase } from '../../contract';
import { enum_ } from '../../model';

export function koaPostOption(apiFactory: ApiFactoryBase, logFactory: LogFactoryBase): KoaOption {
    return (app: Koa) => {
        const router = new Router();

        for (const [route, data] of Object.entries(API_METEDATA)) {
            router[data.method.toLowerCase()](route, async (ctx: Router.RouterContext) => {
                const log = logFactory.build();
                log.addField('route', ctx.request.path)
                    .addField('header', ctx.request.header)
                    .addField('ip', ctx.request.ip)
                    .addField('body', ctx.request.body)
                    .addField('files', ctx.request.files);

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
                    log.addField('timeDiff', (Date.now() - beginOn))
                        .addField('response', ctx.body)
                        .debug();
                } catch (err: Error | any) {
                    if (err instanceof CustomError) {
                        ctx.body = {
                            err: err.code,
                            errMsg: err.data
                        };
                    } else {
                        ctx.body = {
                            err: enum_.ErrorCode.serverInternal,
                            errMsg: (err instanceof Error) ? err.stack : null
                        };
                    }
                    log.addField('timeDiff', (Date.now() - beginOn))
                        .addField('response', ctx.body)
                        .error(err);
                }
            });
        }

        app.use(router.routes());
        app.use(router.allowedMethods());
    };
}
