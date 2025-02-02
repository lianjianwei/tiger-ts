export type LogConfig = Partial<{
    level: 'debug' | 'info' | 'error' | 'none';
    timeFormatter: string;
}>;

export interface ILog {
    addField(key: string, value: any): ILog;
    debug(): void;
    info(): void;
    error(err: Error): void;
}

export abstract class LogBase implements ILog {
    protected data: { [key: string]: any; } = {};

    public addField(key: string, value: any) {
        this.data[key] = value;
        return this;
    }

    public debug() {
        if (LogFactoryBase.logConfig.level != 'info' && LogFactoryBase.logConfig.level != 'error' && LogFactoryBase.logConfig.level != 'none') {
            this.onDebug();
        }
        this.data = {};
    }

    public info() {
        if (LogFactoryBase.logConfig.level != 'error' && LogFactoryBase.logConfig.level != 'none') {
            this.onInfo();
        }
        this.data = {};
    }

    public error(err: Error) {
        if (LogFactoryBase.logConfig.level != 'none') {
            this.onError(err);
        }
        this.data = {};
    }

    protected abstract onDebug(): void;
    protected abstract onInfo(): void;
    protected abstract onError(err: Error): void;
}

export abstract class LogFactoryBase {
    public static logConfig: LogConfig = {
        level: 'debug',
        timeFormatter: 'YYYY-MM-DDTHH:mm:ss.SSS'
    };

    public static setGlobalConfig(config: LogConfig) {
        if (!config) {
            return;
        }
        this.logConfig = config;
    }

    public abstract build(): ILog;
}
