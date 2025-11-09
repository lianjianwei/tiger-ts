import { ILoadBalanceStrategy, LoadBalance } from '../../contract';

/**
 * 随机策略
 */
export class LoadBalanceRandomStrategy implements ILoadBalanceStrategy {

    public constructor(
        private m_LoadBalance: LoadBalance
    ) { }

    public getUrl(app: string) {
        const urls = this.m_LoadBalance[app];
        if (!urls?.length) {
            throw new Error(`LoadBalance[${app}] not found`);
        }

        if (urls.length == 1)
            return urls[0];

        const index = Math.floor(Math.random() * urls.length);
        return urls[index];
    }
}
