import Koa from 'koa';
import compress, { CompressOptions } from 'koa-compress';

import { KoaOption } from './option';

export function koaCompressOption(opt?: CompressOptions): KoaOption {
    return (app: Koa) => {
        app.use(compress(opt));
    };
}
