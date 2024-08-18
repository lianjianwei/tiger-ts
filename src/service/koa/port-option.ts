import dayjs from 'dayjs';
import Koa from 'koa';

import { KoaOption } from './option';

export function koaPortOption(appName: string, port: number, version: string): KoaOption {
    return (app: Koa) => {
        app.listen(port, () => {
            console.log(`koa >> ${appName}(v${version})[${dayjs().format('YYYY-MM-DD hh:mm:ss')}]: ${port}`);
        });
    };
}
