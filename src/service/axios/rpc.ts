import axios from 'axios';

import { CustomError } from '../error';
import { ILoadBalanceStrategy, RpcBase, RpcOption, RpcResponse } from '../../contract';

export class AxiosRpc extends RpcBase {

    public constructor(
        private m_LoadBalanceStrategy: ILoadBalanceStrategy,
        private m_DefaultHeaders: Record<string, string> = {}
    ) {
        super();
    }

    public async call<T>(option: RpcOption) {
        const { app, route, headers, body } = option;
        const url = this.m_LoadBalanceStrategy.getUrl(app);
        const res = await axios.post<RpcResponse<T>>(url + route, body, { headers: { ...this.m_DefaultHeaders, ...headers } });
        if (option.throwError && res.data.err !== 0) {
            throw new CustomError(res.data.err, res.data.errMsg);
        }
        return res.data;
    }
}
