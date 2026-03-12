import Koa from 'koa';
import { Stream } from 'stream';

import { KoaOption } from './option';
import { CustomError } from '../error';
import { BaseState, LogFactoryBase, RouterContext } from '../../contract';
import { enum_ } from '../../model';

export type LogOption = {
    logFactory: LogFactoryBase;
    timeout?: number;
};

export function koaLogOption(logOption: LogOption): KoaOption {
    const { logFactory } = logOption;
    logOption.timeout ??= 2000;
    return (app: Koa) => {
        app.use(async (ctx: RouterContext<any, BaseState>, next) => {
            const log = logFactory.build();
            ctx.state.log = log;
            log.addField('route', ctx.request.path)
                .addField('header', ctx.request.header)
                .addField('ip', ctx.request.ip)
                .addField('body', ctx.request.body)
                .addField('query', ctx.request.query)
                .addField('files', ctx.request.files);
            const beginOn = Date.now();

            try {
                await next();

                if (ctx.body instanceof Stream) {
                    // 流式响应：等待流结束后再记录，响应时间为流完全结束的时间
                    log.addField('response', '[stream]');
                    ctx.body.on('end', () => {
                        const timeDiff = Date.now() - beginOn;
                        log.addField('timeDiff', timeDiff).debug();
                    });
                    ctx.body.on('error', (err) => {
                        const timeDiff = Date.now() - beginOn;
                        log.addField('timeDiff', timeDiff).error(err);
                    });
                } else {
                    const timeDiff = Date.now() - beginOn;
                    log.addField('timeDiff', timeDiff);
                    if (timeDiff > logOption.timeout) {
                        log.addField('timeout', true);
                    }
                    if (ctx.state.originResponse) {
                        log.addField('response', ctx.state.originResponse);
                    } else {
                        log.addField('response', ctx.body);
                    }
                    log.debug();
                }
            } catch (err) {
                if (err instanceof CustomError) {
                    ctx.body = {
                        err: err.code,
                        errMsg: err.data
                    };
                } else {
                    if (err.name == 'SequelizeDatabaseError') {
                        ctx.body = {
                            err: enum_.ErrorCode.serverInternal,
                            errMsg: err.message,
                            errSql: err.sql
                        };
                    } else {
                        ctx.body = {
                            err: enum_.ErrorCode.serverInternal,
                            errMsg: (err instanceof Error) ? err.stack : null
                        };
                    }
                }
                const timeDiff = Date.now() - beginOn;
                log.addField('timeDiff', timeDiff);
                if (timeDiff > logOption.timeout) {
                    log.addField('timeout', true);
                }
                log.addField('response', ctx.body)
                    .error(err);
            }
        });
    };
}
