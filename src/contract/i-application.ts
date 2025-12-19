export interface IApplication {
    listen(port: number, callback?: () => void): Promise<void>;

    close(): Promise<void>;

    /**
     * 获取原始app应用对象
     * 例如 Koa 应用对象
     */
    getOrigin<T>(): T;
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
