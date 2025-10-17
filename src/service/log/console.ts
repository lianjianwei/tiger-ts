import dayjs from 'dayjs';

import { ILog } from '../../contract';

enum LogLevel {
    debug = 1,
    info = 2,
    error = 3,
    none = 4
};

export type ConsoleLogConfig = {
    level: 'debug' | 'info' | 'error' | 'none';
    timeFormatter: string;
};

export class ConsoleLog implements ILog {

    private static logConfig: ConsoleLogConfig = {
        level: 'debug',
        timeFormatter: 'YYYY-MM-DDTHH:mm:ss.SSS'
    };

    private m_Data: { [key: string]: any } = {};

    public addField(key: string, value: any) {
        this.m_Data[key] = value;
        return this;
    }

    public debug() {
        if (LogLevel[ConsoleLog.logConfig.level.toLocaleLowerCase()] <= LogLevel.debug) {
            console.debug(`[${dayjs().format(ConsoleLog.logConfig.timeFormatter)}] [DEBUG] - ${JSON.stringify(this.m_Data)}`);
        }
        this.m_Data = {};
    }

    public info() {
        if (LogLevel[ConsoleLog.logConfig.level.toLocaleLowerCase()] <= LogLevel.info) {
            console.info(`[${dayjs().format(ConsoleLog.logConfig.timeFormatter)}] [INFO] - ${JSON.stringify(this.m_Data)}`);
        }
        this.m_Data = {};
    }

    public error(err: Error) {
        if (LogLevel[ConsoleLog.logConfig.level.toLocaleLowerCase()] <= LogLevel.error) {
            this.m_Data['error'] = err.stack;
            console.error(`[${dayjs().format(ConsoleLog.logConfig.timeFormatter)}] [ERROR] - ${JSON.stringify(this.m_Data)}`);
        }
        this.m_Data = {};
    }

    public static init(cfg: ConsoleLogConfig) {
        ConsoleLog.logConfig = cfg;
    }
}
