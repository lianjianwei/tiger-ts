import { ILoadBalanceStrategy, LoadBalance } from '../../contract';

/**
 * 轮询策略
 */
export class LoadBalanceRoundRobinStrategy implements ILoadBalanceStrategy {

    private m_AppIndex: {
        [app: string]: number;
    } = {};

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

        const index = this.m_AppIndex[app] ?? -1;
        this.m_AppIndex[app] = (index + 1) % urls.length;
        return urls[index];
    }
}
