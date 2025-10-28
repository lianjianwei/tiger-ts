export interface IApplication {
    listen(port: number, callback?: () => void): Promise<void>;

    close(): Promise<void>;
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
