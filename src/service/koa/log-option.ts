import Koa from 'koa';

import { KoaOption } from './option';
import { CustomError } from '../error';
import { BaseState, LogFactoryBase, RouterContext } from '../../contract';
import { enum_ } from '../../model';

export function koaLogOption(logFactory: LogFactoryBase): KoaOption {
    return (app: Koa) => {
        app.use(async (ctx: RouterContext<any, BaseState>, next) => {
            const log = logFactory.build();
            ctx.state.log = log;
            log.addField('route', ctx.request.path)
                .addField('header', ctx.request.header)
                .addField('ip', ctx.request.ip)
                .addField('body', ctx.request.body)
                .addField('files', ctx.request.files);
            const beginOn = Date.now();

            try {
                await next();

                log.addField('timeDiff', (Date.now() - beginOn))
                    .addField('response', ctx.body)
                    .debug();
            } catch (err) {
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
    };
}
