/**
 * 负载均衡策略
 */
export interface ILoadBalanceStrategy {
    getUrl(app: string): string;
}

export type LoadBalance = {
    [app: string]: string[];
};

export type LoadBalanceType = {
    type: 'round-robin' | 'random' | 'weighted' | 'ip-hash' | 'consistent-hash';
};

export type RpcOption = {
    app: string;
    route: string;
    headers?: Record<string, string>;
    body?: Record<string, any>;
};

export type RpcResponse<T> = {
    err: number;
    data?: T;
    errMsg?: any;
};

export abstract class RpcBase {
    public abstract call<T>(option: RpcOption): Promise<RpcResponse<T>>;
}
