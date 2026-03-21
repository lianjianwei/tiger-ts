import 'reflect-metadata';
import './api';

import Router from 'koa-router';
import { LogFactoryBase, service } from 'tiger-ts';
import Container from 'typedi';

import { initIoC } from './service/ioc';

(async () => {
    const cfg = await initIoC();

    const apiFactory = new service.ApiFactory();
    const logFactory = Container.get(LogFactoryBase);

    new service.KoaApplication([
        service.koaCorsOption(cfg.koaCorsOption),
        service.koaCompressOption(cfg.koaCompressOption),
        service.koaBodyOption(cfg.koaBodyOption),
        (app) => {
            const router = new Router();
            router.get('/', async (ctx) => {
                ctx.body = {
                    name: 'tiger-ts-demo',
                    version: '1.0.0'
                };
            });
            app.use(router.routes());
            app.use(router.allowedMethods());
        },
        service.koaLogOption({
            logFactory: logFactory,
            timeout: 5000
        }),
        service.koaRouteOption(apiFactory)
    ], logFactory).listen(cfg.port);
})();
