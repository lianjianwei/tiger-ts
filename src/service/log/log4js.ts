import log4js from 'log4js';

import { ILog } from '../../contract';

export class Log4jsLog implements ILog {

    private m_Data: { [key: string]: any; } = {};

    public addField(key: string, value: any): ILog {
        this.m_Data[key] = value;
        return this;
    }

    public debug() {
        this.log(r => r.debug);
    }

    public info() {
        this.log(r => r.info);
    }

    public error(err: Error) {
        this.addField('error', err.stack);
        this.log(r => r.error);
    }

    private log(action: (logger: log4js.Logger) => (message: string) => void) {
        const logger = log4js.getLogger();
        const fn = action(logger).bind(logger);
        fn(
            JSON.stringify(this.m_Data)
        );
        this.m_Data = {};
    }

    public static init(cfg: log4js.Configuration) {
        log4js.configure(cfg);

        if ('toJSON' in Error.prototype)
            return;

        Object.defineProperty(Error.prototype, 'toJSON', {
            configurable: true,
            writable: true,
            value: function () {
                let alt = {};
                Object.getOwnPropertyNames(this).forEach(function (key) {
                    alt[key] = this[key];
                }, this);
                return alt;
            },
        });
    }
}
