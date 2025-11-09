import axios from 'axios';

import { ILoadBalanceStrategy, RpcBase, RpcOption, RpcResponse } from '../../contract';

export class AxiosRpc extends RpcBase {

    public constructor(
        private m_LoadBalanceStrategy: ILoadBalanceStrategy
    ) {
        super();
    }

    public async call<T>(option: RpcOption) {
        const { app, route, headers, body } = option;
        const url = this.m_LoadBalanceStrategy.getUrl(app);
        const res = await axios.post<RpcResponse<T>>(url + route, body, { headers });
        return res.data;
    }
}
