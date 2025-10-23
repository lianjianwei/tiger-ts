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

    new service.KoaApiPort([
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
        service.koaPostOption(apiFactory, logFactory),
        service.koaPortOption(cfg.name, cfg.port, cfg.version)
    ]).listen();
})()
