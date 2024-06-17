import Koa from 'koa';

import { KoaOption } from './option';
import { IApiPort } from '../../contract';

export class KoaApiPort implements IApiPort {

    public constructor(
        private m_KoaOptions: KoaOption[]
    ) { }

    public listen() {
        const app = new Koa();
        for (const r of this.m_KoaOptions)
            r(app);
    }
}
