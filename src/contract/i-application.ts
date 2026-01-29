import { IncomingMessage, Server, ServerResponse } from 'http';

export interface IApplication {
    listen(port: number, callback?: () => void): Promise<Server<typeof IncomingMessage, typeof ServerResponse>>;

    /**
     * 关闭应用
     * 
     * 1.首先关闭 http 服务，停掉监听端口，拒绝新的连接
     * 2.然后遍历 IApplicationClose 逐个关闭
     * 
     * @param force 是否强制关闭
     */
    close(force?: boolean): Promise<void>;

    /**
     * 获取原始app应用对象
     * 例如 Koa 应用对象
     */
    getOrigin<T>(): T;
}

export interface IApplicationClose {
    /**
     * 关闭应用
     */
    close(force?: boolean): Promise<void>;
}

export interface IApplicationEvent {
    /**
     * 事件名称
     */
    name: string;

    /**
     * 事件调用
     */
    call(): Promise<void>;
}
