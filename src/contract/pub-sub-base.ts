export interface ISubscribe<T = any> {
    name: string;

    callback(message: T): Promise<void>;
}

export abstract class PubSubBase {
    public abstract subscribe<T>(channel: string, subscribe: ISubscribe<T>): Promise<void>;

    public abstract publish<T>(channel: string, data: T): Promise<void>;

    public abstract unsubscribe<T>(channel: string, subscribe: ISubscribe<T>): Promise<void>;
}
