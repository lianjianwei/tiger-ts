import Redis, { RedisOptions } from 'ioredis';

import { ISubscribe, PubSubBase, LogFactoryBase } from '../../contract';

export class RedisPubSub extends PubSubBase {

    private m_ChannelSubscribeMap: {
        [channel: string]: ISubscribe[];
    } = {};

    private m_SubscribeRedis: Redis;

    private m_PublishRedis: Redis;

    public constructor(
        private m_RedisOption: RedisOptions,
        private m_LogFactory: LogFactoryBase
    ) {
        super();
        this.m_SubscribeRedis = new Redis(this.m_RedisOption);
        this.m_PublishRedis = new Redis(this.m_RedisOption);

        this.m_SubscribeRedis.on('message', (channel, message) => {
            try {
                const data = JSON.parse(message);
                const subscribes = this.m_ChannelSubscribeMap[channel];
                if (subscribes) {
                    subscribes.forEach(subscribe => {
                        subscribe.callback(data)
                            .catch(err => {
                                this.m_LogFactory.build()
                                    .addField('channel', channel)
                                    .addField('message', message)
                                    .addField('subscribe', subscribe.name)
                                    .error(err);
                            });
                    });
                }
            } catch (err) {
                this.m_LogFactory.build()
                    .addField('channel', channel)
                    .addField('message', message)
                    .error(err);
            }
        });
    }

    public async subscribe<T>(channel: string, subscribe: ISubscribe<T>) {
        if (this.m_ChannelSubscribeMap[channel]) {
            const exists = this.m_ChannelSubscribeMap[channel].includes(subscribe);
            if (!exists)
                this.m_ChannelSubscribeMap[channel].push(subscribe);
        } else {
            this.m_ChannelSubscribeMap[channel] = [subscribe];
            await this.m_SubscribeRedis.subscribe(channel);
        }
        this.m_LogFactory.build()
            .addField('title', '订阅渠道')
            .addField('channel', channel)
            .addField('subscribe', subscribe.name)
            .debug();
    }

    public async publish<T>(channel: string, data: T) {
        await this.m_PublishRedis.publish(channel, JSON.stringify(data));
    }

    public async unsubscribe<T>(channel: string, subscribe: ISubscribe<T>) {
        if (this.m_ChannelSubscribeMap[channel]) {
            const index = this.m_ChannelSubscribeMap[channel].indexOf(subscribe);
            if (index !== -1) {
                this.m_ChannelSubscribeMap[channel].splice(index, 1);
            }
            if (this.m_ChannelSubscribeMap[channel].length == 0) {
                delete this.m_ChannelSubscribeMap[channel];
                await this.m_SubscribeRedis.unsubscribe(channel);
            }
        }
        this.m_LogFactory.build()
            .addField('title', '取消订阅渠道')
            .addField('channel', channel)
            .addField('unsubscribe', subscribe.name)
            .debug();
    }
}
