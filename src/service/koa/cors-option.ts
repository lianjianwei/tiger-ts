import Koa from 'koa';
import cors from '@koa/cors';

import { KoaOption } from './option';

export function koaCorsOption(opt?: cors.Options): KoaOption {
    return (app: Koa) => {
        app.use(cors(opt));
    };
}
