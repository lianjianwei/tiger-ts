import { IncomingMessage, Server, ServerResponse } from 'http';
import Koa from 'koa';
import Container from 'typedi';

import { KoaOption } from './option';
import { IApplication, LogFactoryBase } from '../../contract';
import { APPLICATION_AFTER_EVENT_METADATA, APPLICATION_BEFORE_EVENT_METADATA, APPLICATION_CLOSE_METADATA } from '../../decorator';

export class KoaApplication implements IApplication {

    private m_App: Koa;
    private m_Server: Server<typeof IncomingMessage, typeof ServerResponse>;

    private m_Listening: boolean = false;

    public constructor(
        private m_KoaOptions: KoaOption[],
        private m_LogFactory: LogFactoryBase
    ) {
        this.m_App = new Koa();
    }

    public getOrigin<T>(): T {
        return this.m_App as T;
    }

    public async listen(port: number, callback?: () => void) {
        if (this.m_Listening)
            return;

        await this.onBefore();

        for (const r of this.m_KoaOptions)
            r(this.m_App);

        this.m_Server = this.m_App.listen(port, callback);
        this.m_Listening = true;

        await this.onAfter();

        return this.m_Server;
    }

    public async close(force?: boolean) {
        this.m_Server.close();
        this.m_Server = null;
        this.m_App = null;

        for (const r of APPLICATION_CLOSE_METADATA) {
            const instance = Container.get(r);
            if (instance && typeof instance.close === 'function')
                await instance.close(force);
        }
    }

    private async onBefore() {
        for (const r of APPLICATION_BEFORE_EVENT_METADATA) {
            const begin = Date.now();
            const instance = Container.get(r);
            await instance.call();
            this.m_LogFactory.build()
                .addField('message', 'Execute the event before the application starts.')
                .addField('event', instance.name)
                .addField('time', (Date.now() - begin) + 'ms')
                .debug();
        }
    }

    private async onAfter() {
        for (const r of APPLICATION_AFTER_EVENT_METADATA) {
            const begin = Date.now();
            const instance = Container.get(r);
            await instance.call();
            this.m_LogFactory.build()
                .addField('message', 'Execute the event after the application starts.')
                .addField('event', instance.name)
                .addField('time', (Date.now() - begin) + 'ms')
                .debug();
        }
    }
}
