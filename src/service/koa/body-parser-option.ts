import Koa from 'koa';
import bodyParser from 'koa-bodyparser';

import { KoaOption } from './option';

export function koaBodyParserOption(opt?: bodyParser.Options): KoaOption {
    return (app: Koa) => {
        app.use(bodyParser(opt));
    };
}
