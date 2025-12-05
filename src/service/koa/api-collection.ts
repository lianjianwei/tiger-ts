import dayjs from 'dayjs';
import Redis from 'ioredis';
import Koa from 'koa';

import { BaseState, RouterContext } from '../../contract';

export type ApiCollectionOption = Partial<{
    name: string;
    enable: boolean;
    expire: number;
    excludePaths: string[];
    prefix: string;
    timeGranularity: number;
}>;

function matchPath(excludePaths: string[], path: string) {
    if (!excludePaths)
        return false;

    return excludePaths.some(p => path.includes(p));
}

export function koaApiCollectionOption(option: ApiCollectionOption, statisticsRedis: Redis) {
    option ??= {};
    option.prefix = option.prefix || 'api';
    option.expire = option.expire || 600;
    option.timeGranularity = option.timeGranularity || 300;

    const name = option.name ? option.name + ':' : '';

    return (app: Koa) => {
        app.use(async (ctx: RouterContext<any, BaseState>, next) => {
            const exclude = matchPath(option.excludePaths, ctx.request.path);
            if (!exclude) {
                const appid = (ctx.request.header['appid'] || '') as string;
                const now = dayjs().unix();
                const time = now - now % option.timeGranularity;
                const key = `${option.prefix}:${time}:${name}${ctx.request.path}`;
                statisticsRedis.hincrby(key, appid, 1)
                    .then(count => {
                        if (count == 1)
                            statisticsRedis.expire(key, option.expire);
                    });
            }

            await next();
        });
    };
}
