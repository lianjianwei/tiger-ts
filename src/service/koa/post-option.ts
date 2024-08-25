import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import Koa from 'koa';
import Router from 'koa-router';

import { KoaOption } from './option';
import { CustomError } from '../error';
import { ApiFactoryBase } from '../../contract';
import { enum_ } from '../../model';
import { model } from '../..';

export function koaPostOption(apiFactory: ApiFactoryBase): KoaOption {
    return (app: Koa) => {
        const router = new Router();

        router.post('/:endpoint/:api', async (ctx) => {
            try {
                const { api, validateType } = apiFactory.build(ctx.request.path);
                if (validateType) {
                    api.body = plainToInstance(validateType, ctx.request.body);
                    const res = await validate(api.body);
                    if (res.length)
                        throw new CustomError(model.enum_.ErrorCode.invalidParams, res);
                } else {
                    api.body = ctx.request.body;
                }
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
