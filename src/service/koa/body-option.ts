import Koa from 'koa';
import { koaBody, KoaBodyMiddlewareOptions } from 'koa-body';

import { KoaOption } from './option';

export function koaBodyOption(opt?: KoaBodyMiddlewareOptions): KoaOption {
    return (app: Koa) => {
        app.use(koaBody(opt));
    };
}
