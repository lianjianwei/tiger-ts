export interface ILog {
    addField(key: string, value: any): ILog;
    debug(): void;
    info(): void;
    error(err: Error): void;
}

export abstract class LogFactoryBase {
    public abstract build(): ILog;
}
