import { KoaBodyMiddlewareOptions } from 'koa-body';
import { CompressOptions } from 'koa-compress';
import cors from '@koa/cors';
import log4js from 'log4js';

export class App {
    public name: string;
    public version: string;
    public port: number;

    public koaBodyOption: KoaBodyMiddlewareOptions;
    public koaCompressOption: CompressOptions;
    public koaCorsOption: cors.Options;

    public logConfiguration: {
        log4js: log4js.Configuration;
    };
}
